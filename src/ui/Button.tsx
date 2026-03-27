import React from 'react'
import { cn } from './cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'primary',
  loading,
  className,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const base =
    'dm-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out disabled:opacity-60 disabled:pointer-events-none'
  const variants: Record<Variant, string> = {
    primary:
      'accent-gradient dm-shine text-black shadow-[0_0_0_1px_rgba(0,0,0,0.25)] hover:brightness-110 active:brightness-95',
    secondary:
      'bg-white/5 text-white hover:bg-white/8 border border-white/10 hover:-translate-y-px',
    ghost: 'text-white/80 hover:text-white hover:bg-white/6 hover:-translate-y-px',
    danger: 'bg-red-500/15 text-red-200 hover:bg-red-500/20 border border-red-500/25 hover:-translate-y-px',
  }

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}

