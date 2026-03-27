import { Brain, Sparkles } from 'lucide-react'

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative h-9 w-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 grid place-items-center shadow-[0_0_0_1px_rgba(0,0,0,0.25)]">
        <Brain className="h-4 w-4 text-indigo-400" />
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-indigo-500 drop-shadow-[0_0_12px_rgba(99,102,241,0.55)]" />
      </div>

      {compact ? null : (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white tracking-tight">DocMind</div>
          <div className="text-xs text-white/45">PDF Q&A</div>
        </div>
      )}
    </div>
  )
}

