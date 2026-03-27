import React, { forwardRef } from 'react'
import { cn } from './cn'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'dm-ring w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 transition-all duration-200 hover:bg-white/7 focus:bg-white/7',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

