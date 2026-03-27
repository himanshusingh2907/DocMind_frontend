import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--dm-bg)',
        surface: 'var(--dm-surface)',
        surface2: 'var(--dm-surface-2)',
        border: 'var(--dm-border)',
        text: 'var(--dm-text)',
        muted: 'var(--dm-muted)',
        accent: 'var(--dm-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config

