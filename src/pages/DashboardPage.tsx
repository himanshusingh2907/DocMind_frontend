import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { api, getErrorMessage } from '../lib/api'
import type { DocumentItem } from '../lib/types'
import { formatBytes, formatDate } from '../lib/format'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'
import { AlertTriangle, Boxes, CalendarClock, FileText, MessageSquare, Trash2, UploadCloud } from 'lucide-react'

function normalizeDocs(data: any): DocumentItem[] {
  const arr = Array.isArray(data) ? data : Array.isArray(data?.docs) ? data.docs : []
  return arr
    .map((d: any): DocumentItem | null => {
      const id = String(d?.id ?? d?._id ?? d?.documentId ?? '')
      const name = String(d?.name ?? d?.fileName ?? d?.filename ?? d?.originalName ?? 'Untitled.pdf')
      if (!id) return null

      const sizeBytes =
        typeof d?.sizeBytes === 'number'
          ? d.sizeBytes
          : typeof d?.fileSize === 'number'
            ? d.fileSize
            : typeof d?.size === 'number'
              ? d.size
              : null

      const chunks =
        typeof d?.noOfChunks === 'number'
          ? d.noOfChunks
          : typeof d?.chunks === 'number'
            ? d.chunks
            : typeof d?.chunkCount === 'number'
              ? d.chunkCount
              : null

      const status = d?.status ? String(d.status) : null
      const uploadedAt = d?.uploadedAt ?? d?.createdAt ?? d?.uploadDate ?? null
      return { id, name, sizeBytes, chunks, status, uploadedAt }
    })
    .filter(Boolean) as DocumentItem[]
}

function statusUI(status?: string | null) {
  const s = (status ?? 'pending').toLowerCase()
  if (s === 'completed' || s === 'ready') {
    return { label: 'Ready', cls: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/25' }
  }
  if (s === 'failed' || s === 'error') {
    return { label: 'Failed', cls: 'bg-red-500/10 text-red-200 border-red-500/25' }
  }
  return { label: 'Processing', cls: 'bg-amber-500/10 text-amber-200 border-amber-500/25' }
}

function StatusPill({ status }: { status?: string | null }) {
  const { label, cls } = statusUI(status)
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-0.5 text-xs', cls)}>
      {label}
    </span>
  )
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-2">
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 grid place-items-center">
          <svg width="42" height="42" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 14H40L48 22V50C48 52.2091 46.2091 54 44 54H20C17.7909 54 16 52.2091 16 50V18C16 15.7909 17.7909 14 20 14Z"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M40 14V22H48" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
            <path
              d="M22 30H42"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M22 37H37"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="absolute -right-3 -top-2 h-10 w-10 rounded-full bg-indigo-500/15 border border-indigo-500/30 grid place-items-center animate-[dm-float_6s_ease-in-out_infinite]">
          <MessageSquare className="h-4 w-4 text-indigo-200" />
        </div>
      </div>

      <div className="text-lg font-semibold text-white">No documents yet. Upload your first PDF.</div>
      <div className="mt-2 text-sm text-white/60 max-w-sm">
        Once uploaded, DocMind will parse, embed, and make every section instantly searchable.
      </div>

      <div className="mt-7">
        <Button onClick={onUpload} className="h-11">
          <UploadCloud className="h-4 w-4" />
          Upload your PDF
        </Button>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await api.get('/file')
      setDocs(normalizeDocs(res.data))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load documents.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const headerRight = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={() => navigate('/upload')} className="h-10">
          Upload
        </Button>
      </div>
    ),
    [loading, navigate],
  )

  const totalDocs = docs.length
  const lastActive = useMemo(() => {
    const dates = docs
      .map((d) => (d.uploadedAt ? new Date(d.uploadedAt).getTime() : null))
      .filter((n): n is number => typeof n === 'number' && !Number.isNaN(n))
    if (dates.length === 0) return null
    const max = Math.max(...dates)
    return new Date(max).toISOString()
  }, [docs])

  async function onDelete(id: string) {
    if (deletingId) return
    setDeletingId(id)
    try {
      await api.delete(`/file/${encodeURIComponent(id)}`)
      setDocs((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete document.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm text-white/55">Welcome</div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Good morning, {user?.name ?? 'Himanshu'} 👋
          </h2>
          <div className="mt-2 text-sm text-white/60">RAG over your PDFs—search, summarize, and answer instantly.</div>
        </div>
        {headerRight}
      </div>

      <div className="dm-stats-grid gap-3">
        <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]">
          <div className="text-xs text-white/55">Total PDFs</div>
          <div className="mt-1 text-2xl font-semibold">{totalDocs}</div>
        </div>
        <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]">
          <div className="text-xs text-white/55">Total Questions Asked</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]">
          <div className="text-xs text-white/55">Last Active</div>
          <div className="mt-1 text-2xl font-semibold">{lastActive ? formatDate(lastActive) : '—'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">Your Documents</h3>
          <div className="mt-1 text-sm text-white/55">Upload PDFs to power your chat.</div>
        </div>
        <Button onClick={() => navigate('/upload')} className="h-10">
          Upload PDF
        </Button>
      </div>

      {error ? (
        <div className="dm-card-soft rounded-2xl p-4 border border-red-500/25 bg-red-500/10 text-red-200 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm text-red-200/80 mt-1">{error}</div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="dm-doc-grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dm-card-soft rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl skeleton" />
                  <div className="min-w-0">
                    <div className="h-4 skeleton w-40" />
                    <div className="mt-2 h-3 skeleton w-28" />
                  </div>
                </div>
                <div className="h-6 w-20 skeleton rounded-full" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-3 skeleton w-24" />
                <div className="h-3 skeleton w-24" />
              </div>
              <div className="mt-5 h-10 skeleton rounded-xl" />
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState onUpload={() => navigate('/upload')} />
      ) : (
        <div className="dm-doc-grid gap-3">
          {docs.map((d) => {
            return (
              <div
                key={d.id}
                className="dm-card rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_44px_rgba(99,102,241,0.22)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 grid place-items-center">
                      <FileText className="h-5 w-5 text-indigo-200" />
                    </div>
                    <button
                      className="text-left min-w-0"
                      onClick={() => navigate(`/chat/${encodeURIComponent(d.id)}`)}
                    >
                      <div className="truncate text-white font-semibold">{d.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDate(d.uploadedAt ?? null)}
                        </span>
                      </div>
                    </button>
                  </div>
                  <StatusPill status={d.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1">
                    <Boxes className="h-3.5 w-3.5" />
                    {typeof d.sizeBytes === 'number' ? formatBytes(d.sizeBytes) : '—'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Boxes className="h-3.5 w-3.5" />
                    {typeof d.chunks === 'number' ? `${d.chunks} chunks` : '—'}
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <Button onClick={() => navigate(`/chat/${encodeURIComponent(d.id)}`)} className="h-10">
                    <MessageSquare className="h-4 w-4" />
                    Chat Now
                  </Button>

                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8"
                    loading={deletingId === d.id}
                    onClick={() => void onDelete(d.id)}
                    aria-label={`Delete ${d.name}`}
                    disabled={deletingId !== null && deletingId !== d.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-200" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

