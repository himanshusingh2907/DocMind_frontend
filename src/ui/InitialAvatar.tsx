import { cn } from './cn'

const palette = [
  { bg: 'bg-indigo-500/15', ring: 'border-indigo-500/30', text: 'text-indigo-200' },
  { bg: 'bg-fuchsia-500/15', ring: 'border-fuchsia-500/30', text: 'text-fuchsia-200' },
  { bg: 'bg-purple-500/15', ring: 'border-purple-500/30', text: 'text-purple-200' },
  { bg: 'bg-cyan-500/15', ring: 'border-cyan-500/30', text: 'text-cyan-200' },
  { bg: 'bg-emerald-500/15', ring: 'border-emerald-500/30', text: 'text-emerald-200' },
]

function initialFrom(value?: string | null) {
  const s = (value ?? '').trim()
  if (!s) return '?'
  const first = s[0]!
  return first.toUpperCase()
}

function paletteIndex(value?: string | null) {
  const s = (value ?? '').trim().toUpperCase()
  if (!s) return 0
  const code = s.charCodeAt(0) || 0
  return code % palette.length
}

export function InitialAvatar({ value, className }: { value?: string | null; className?: string }) {
  const letter = initialFrom(value)
  const p = palette[paletteIndex(value)]

  return (
    <div
      className={cn(
        'h-9 w-9 rounded-full border grid place-items-center font-semibold text-sm',
        p.bg,
        p.ring,
        p.text,
        className,
      )}
      aria-hidden="true"
    >
      {letter}
    </div>
  )
}

