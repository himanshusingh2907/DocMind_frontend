import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

const MAX_BYTES = 10 * 1024 * 1024

function validate(file: File) {
  const nameOk = file.name.toLowerCase().endsWith('.pdf')
  const typeOk = file.type === 'application/pdf' || file.type === ''
  if (!nameOk && !typeOk) return 'Please upload a PDF file.'
  if (file.size > MAX_BYTES) return 'File is too large. Max size is 10MB.'
  return null
}

function bytesToMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2)
}

export function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number>(0)

  const [success, setSuccess] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const helper = useMemo(() => {
    if (!file) return 'PDF only • Max 10MB'
    return `${file.name} • ${bytesToMB(file.size)} MB`
  }, [file])

  const steps = ['Uploading', 'Parsing', 'Embedding', 'Ready'] as const
  const stepIndex = useMemo(() => {
    if (!busy && !success) return 0
    if (success) return 3
    if (progress < 25) return 0
    if (progress < 55) return 1
    if (progress < 85) return 2
    return 3
  }, [busy, progress, success])

  function pickFile(f: File | null) {
    setError(null)
    setProgress(0)
    setSuccess(false)
    setDocumentId(null)

    if (!f) {
      setFile(null)
      return
    }

    const v = validate(f)
    if (v) {
      setFile(null)
      setError(v)
      return
    }

    setFile(f)
  }

  async function upload() {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    setProgress(0)
    setSuccess(false)
    setDocumentId(null)

    try {
      const fd = new FormData()
      fd.append('pdf', file)

      const res = await api.post('/file/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const total = evt.total ?? file.size
          const p = total ? Math.round((evt.loaded / total) * 100) : 0
          setProgress(Math.max(0, Math.min(100, p)))
        },
      })

      setProgress(100)
      setSuccess(true)
      setDocumentId(res.data?.documentId ? String(res.data.documentId) : null)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed.'))
      setSuccess(false)
    } finally {
      setBusy(false)
    }
  }

  const canUpload = !!file && !busy && !success

  return (
    <div className="flex items-start justify-center py-8 md:py-12 px-4">
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-white/55">Upload</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Drop your PDF</h1>
            <p className="mt-2 text-sm text-white/60">Upload, process, then start chatting instantly.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="h-10">
            Back
          </Button>
        </div>

        {error ? (
          <div className="dm-card-soft rounded-2xl p-4 border border-red-500/25 bg-red-500/10 text-red-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <div className="font-semibold">Upload error</div>
              <div className="text-sm text-red-200/80 mt-1">{error}</div>
            </div>
          </div>
        ) : null}

        <div className="dm-card rounded-2xl p-4 md:p-6">
          <div
            className={cn(
              'rounded-2xl border-2 border-dashed transition-all duration-200',
              dragOver ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_44px_rgba(99,102,241,0.18)]' : 'border-white/15 bg-white/2',
            )}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOver(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOver(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOver(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragOver(false)
              const f = e.dataTransfer.files?.[0] ?? null
              pickFile(f)
            }}
          >
          {/* Drag zone */}
            <div className="flex flex-col items-center text-center p-6 md:p-10">
              <div
                className={cn(
                  'rounded-2xl p-4 border border-white/10 bg-white/5',
                  dragOver ? 'border-indigo-500/40' : '',
                )}
              >
              <UploadCloud
                className={cn(
                  'h-10 w-10 text-indigo-200',
                  dragOver ? 'animate-[dm-float_1.4s_ease-in-out_infinite]' : 'transition-transform duration-200',
                )}
              />
              </div>

              <div className="mt-5">
                <div className="text-base font-semibold text-white">
                  Drop your PDF here or click to browse
                </div>
                <div className="mt-1 text-sm text-white/60">{helper}</div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="h-11"
                >
                  Choose file
                </Button>
                <Button onClick={() => void upload()} disabled={!canUpload} loading={busy} className="h-11">
                  {success ? (
                    <>Uploaded</>
                  ) : (
                    <>
                      Upload & Process
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* File info */}
            {file ? (
              <div className="mt-6 dm-card-soft rounded-2xl p-4 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 grid place-items-center">
                      <FileText className="h-5 w-5 text-indigo-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate text-white">{file.name}</div>
                      <div className="text-xs text-white/60">{bytesToMB(file.size)} MB</div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex items-center gap-2 text-emerald-200 text-sm',
                      !busy ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        'h-5 w-5',
                        !busy ? 'animate-[dm-bounce_1.2s_ease-in-out_infinite]' : '',
                      )}
                    />
                    Ready
                  </div>
                </div>
              </div>
            ) : null}

            {/* Progress */}
            {busy ? (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-indigo-500/90"
                    style={{ width: `${progress}%`, transition: 'width 200ms ease-in-out' }}
                  />
                </div>

                <div className="mt-4">
                  <div className="text-xs text-white/55 mb-2">Steps</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {steps.map((s, idx) => {
                      const state = idx < stepIndex ? 'done' : idx === stepIndex ? 'current' : 'upcoming'
                      return (
                        <div key={s} className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full border',
                              state === 'done'
                                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
                                : state === 'current'
                                  ? 'border-indigo-500/25 bg-indigo-500/10 text-indigo-200'
                                  : 'border-white/10 bg-white/5 text-white/55',
                            )}
                          >
                            {s}
                          </span>
                          {idx < steps.length - 1 ? <span className="text-white/35">→</span> : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Success */}
            {success ? (
              <div className="mt-7 dm-card-soft rounded-2xl p-6 border border-emerald-500/25 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                  <div>
                    <div className="text-sm text-emerald-200 font-semibold">PDF is ready</div>
                    <div className="text-xs text-white/60 mt-0.5">
                      Embeddings built. Ready for question answering.
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="text-xs text-white/60">
                    Tip: Ask about key sections, definitions, or summaries.
                  </div>
                  <Button
                    onClick={() => {
                      if (documentId) navigate(`/chat/${encodeURIComponent(documentId)}`)
                      else navigate('/dashboard')
                    }}
                    className="h-11"
                  >
                    Start Chatting
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

