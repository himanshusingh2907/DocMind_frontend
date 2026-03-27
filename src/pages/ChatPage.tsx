import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import type { ChatMessage, ChatRole } from '../lib/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Markdown } from '../ui/Markdown'
import { useAuth } from '../state/auth'
import { InitialAvatar } from '../ui/InitialAvatar'
import { cn } from '../ui/cn'
import { ArrowLeft, Brain, MessageSquare, Send, Sparkles } from 'lucide-react'

function formatTime(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function normalizeHistory(data: any): { messages: ChatMessage[]; documentName?: string } {
  const docName = data?.documentName ?? data?.docName ?? data?.document?.name ?? undefined
  const raw = Array.isArray(data) ? data : Array.isArray(data?.messages) ? data.messages : Array.isArray(data?.history) ? data.history : []

  const msgs: ChatMessage[] = []

  // Expected backend shape: array of chat documents with { questions: [...], answer: [...] }.
  raw.forEach((m: any, idx: number) => {
    const createdAt = m?.createdAt ?? m?.timestamp ?? null

    if (Array.isArray(m?.questions) || Array.isArray(m?.answer)) {
      if (Array.isArray(m?.questions)) {
        m.questions.forEach((q: any, qIdx: number) => {
          msgs.push({
            id: String(m?._id ?? `q-${idx}-${qIdx}`),
            role: 'user',
            content: String(q ?? ''),
            createdAt: createdAt ? String(createdAt) : null,
          })
        })
      }
      if (Array.isArray(m?.answer)) {
        m.answer.forEach((a: any, aIdx: number) => {
          msgs.push({
            id: String(m?._id ?? `a-${idx}-${aIdx}`),
            role: 'assistant',
            content: String(a ?? ''),
            createdAt: createdAt ? String(createdAt) : null,
          })
        })
      }
      return
    }

    // Generic shape: { role, content }.
    if (m?.role && (m?.content ?? m?.message ?? m?.text)) {
      const role = String(m.role) as ChatRole
      const content = String(m.content ?? m.message ?? m.text)
      msgs.push({
        id: String(m.id ?? m._id ?? `h-${idx}`),
        role: role === 'assistant' ? 'assistant' : 'user',
        content,
        createdAt: m.createdAt ?? m.timestamp ?? null,
      })
    }
  })

  return { messages: msgs, documentName: docName }
}

function bubbleClass(role: ChatRole) {
  return role === 'user'
    ? 'bg-indigo-500/15 border border-indigo-500/25 text-white'
    : 'bg-[#1a1a1a] border border-white/10 border-l-4 border-l-indigo-500/60 text-white'
}

function AiAvatar() {
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 grid place-items-center relative">
      <Brain className="h-4 w-4 text-indigo-200" />
      <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-indigo-500 drop-shadow-[0_0_14px_rgba(99,102,241,0.5)]" />
    </div>
  )
}

export function ChatPage() {
  const { user, logout } = useAuth()
  const { documentId } = useParams()
  const navigate = useNavigate()

  const [docName, setDocName] = useState<string>('Document')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const id = useMemo(() => documentId ?? '', [documentId])

  const historyQuestions = useMemo(() => {
    return messages
      .filter((m) => m.role === 'user')
      .slice(-30)
      .map((m) => ({ id: m.id, content: m.content }))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length, asking])

  useEffect(() => {
    let alive = true

    void (async () => {
      if (!id) return
      setError(null)
      setLoadingHistory(true)
      try {
        const res = await api.get(`/chat/history/${encodeURIComponent(id)}`)
        const norm = normalizeHistory(res.data)
        if (!alive) return
        setMessages(norm.messages)
        if (norm.documentName) setDocName(String(norm.documentName))
      } catch (err) {
        if (!alive) return
        setError(getErrorMessage(err, 'Failed to load chat history.'))
      } finally {
        if (!alive) return
        setLoadingHistory(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [id])

  async function ask(qOverride?: string) {
    const q = (qOverride ?? question).trim()
    if (!q || asking || !id) return

    setError(null)
    if (qOverride == null) setQuestion('')

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: q, createdAt: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])

    setAsking(true)
    try {
      const res = await api.post('/chat/ask', { documentId: id, question: q })
      const answer =
        res.data?.answer ??
        res.data?.response ??
        res.data?.message ??
        (typeof res.data === 'string' ? res.data : null) ??
        ''

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: String(answer || 'No answer returned.'),
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to get an answer.'))
      if (qOverride == null) setQuestion(q)
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="md:grid md:grid-cols-[260px_1fr] gap-4 md:gap-6">
          {/* SIDEBAR */}
          <aside className="md:sticky md:top-6 self-start">
            <div className="dm-card rounded-2xl p-4 flex flex-col h-auto md:h-[calc(100vh-100px)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <MessageSquare className="h-4 w-4 text-indigo-200" />
                  </div>
                  <div className="font-semibold text-white">DocMind</div>
                </div>

                <Button variant="secondary" onClick={() => navigate('/dashboard')} className="h-9 px-3">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </div>

              <div className="mt-4 dm-card-soft rounded-2xl p-4">
                <div className="text-xs text-white/55">Document</div>
                <div className="mt-1 text-sm font-semibold text-white truncate">{docName}</div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-[11px] text-white/45">Pages</div>
                    <div className="mt-0.5 font-semibold text-white">—</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-[11px] text-white/45">Chunks</div>
                    <div className="mt-0.5 font-semibold text-white">—</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-white/55">Previous questions</div>
                  <div className="text-[11px] text-white/35">{historyQuestions.length}</div>
                </div>

                <div className="overflow-y-auto pr-1 max-h-[360px]">
                  {historyQuestions.length === 0 ? (
                    <div className="text-sm text-white/55 rounded-xl border border-white/10 bg-white/5 p-3">
                      Ask something to populate your history.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {historyQuestions
                        .slice()
                        .reverse()
                        .map((q) => (
                          <button
                            key={q.id}
                            onClick={() => {
                              setQuestion(q.content)
                              bottomRef.current?.scrollIntoView({ behavior: 'auto' })
                              inputRef.current?.focus()
                            }}
                            className="w-full text-left dm-ring rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/8 transition-all duration-200"
                          >
                            <div className="truncate">{q.content}</div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <InitialAvatar value={user?.name ?? user?.email ?? 'Guest'} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{user?.name ?? 'Guest'}</div>
                    <div className="text-xs text-white/55 truncate">{user?.email ?? '—'}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Button variant="secondary" onClick={logout} className="w-full h-10">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CHAT */}
          <main className="min-w-0">
            <div className="dm-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 bg-white/2 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/55">Chat</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="truncate text-white font-semibold">{docName}</div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      Powered by Gemini AI
                    </span>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="border-b border-red-500/25 bg-red-500/10 px-5 py-4 text-red-200 flex items-start gap-3">
                  <AlertBubble />
                  <div>
                    <div className="font-semibold">Something went wrong</div>
                    <div className="text-sm text-red-200/80 mt-1">{error}</div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-190px)]">
                <div className="flex-1 overflow-y-auto px-4 py-5">
                  {loadingHistory ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex',
                            i % 2 === 0 ? 'justify-start' : 'justify-end',
                          )}
                        >
                          <div className="max-w-[80%] dm-card-soft rounded-2xl p-4">
                            <div className="h-4 skeleton w-56" />
                            <div className="mt-3 h-3 skeleton w-44" />
                            <div className="mt-3 h-3 skeleton w-52" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center max-w-md px-2">
                        <div className="text-xl font-semibold text-white">Ask anything about this document</div>
                        <div className="mt-2 text-sm text-white/60">Start with a suggestion to get a strong first answer.</div>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                          {['Summarize this PDF', 'What are the key points?', 'List all topics covered'].map((t) => (
                            <Button
                              key={t}
                              variant="secondary"
                              className="h-10"
                              onClick={() => void ask(t)}
                            >
                              {t}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          {m.role === 'assistant' ? <AiAvatar /> : null}

                          <div className={cn('max-w-[85%] md:max-w-[72%] rounded-2xl p-3 md:p-4', bubbleClass(m.role))}>
                            <div className="text-[13px] md:text-sm">
                              {m.role === 'assistant' ? <Markdown content={m.content} /> : m.content}
                            </div>
                            <div
                              className={cn(
                                'mt-2 text-[11px] text-white/45',
                                m.role === 'user' ? 'text-right' : 'text-left',
                              )}
                            >
                              {formatTime(m.createdAt)}
                            </div>
                          </div>

                          {m.role === 'user' ? <InitialAvatar value={user?.name ?? user?.email ?? 'U'} className="h-8 w-8 text-xs" /> : null}
                        </div>
                      ))}

                      {asking ? (
                        <div className="flex gap-3 justify-start">
                          <AiAvatar />
                          <div className="max-w-[72%] rounded-2xl bg-[#1a1a1a] border border-white/10 border-l-4 border-l-indigo-500/60 p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-semibold text-white/85">Gemini is typing</div>
                              <div className="flex items-center gap-2">
                                <span className="dm-typing-dot" />
                                <span className="dm-typing-dot" />
                                <span className="dm-typing-dot" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-white/10 bg-white/2 p-4 md:p-5">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask about this PDF…"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            void ask()
                          }
                        }}
                        disabled={asking}
                        className="rounded-full pr-12 bg-white/5 border border-white/10"
                      />

                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Button
                          onClick={() => void ask()}
                          disabled={!question.trim() || asking}
                          variant="primary"
                          className="h-10 w-10 px-0 py-0 rounded-full"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-white/45">
                        {historyQuestions.length > 0 ? 'Press Enter to send • Shift+Enter for newline (disabled)' : 'Press Enter to send'}
                      </div>
                      {question.trim() ? (
                        <div className="text-xs text-indigo-200/70">Ready</div>
                      ) : (
                        <div className="text-xs text-white/35">Type a question</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function AlertBubble() {
  return (
    <div className="h-9 w-9 rounded-2xl bg-red-500/15 border border-red-500/25 grid place-items-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 9V13"
          stroke="rgba(254,202,202,1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 17H12.01"
          stroke="rgba(254,202,202,1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.29 3.86L1.82 18.01C1.4 18.74 1.91 19.6 2.74 19.6H21.26C22.09 19.6 22.6 18.74 22.18 18.01L13.71 3.86C13.29 3.13 10.71 3.13 10.29 3.86Z"
          stroke="rgba(254,202,202,1)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

