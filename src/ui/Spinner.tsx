import { cn } from './cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-accent',
        className,
      )}
      aria-label="Loading"
      role="status"
    />
  )
}

