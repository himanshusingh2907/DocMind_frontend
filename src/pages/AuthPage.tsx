// import React, { useMemo, useState } from 'react'
// import { Navigate, useLocation, useNavigate } from 'react-router-dom'
// import { Mail, Lock, Sparkles, ShieldCheck, FileText } from 'lucide-react'
// import { useAuth, useFriendlyAuthError } from '../state/auth'
// import { Button } from '../ui/Button'
// import { Input } from '../ui/Input'
// import { Logo } from '../ui/Logo'
// import { cn } from '../ui/cn'

// type Mode = 'login' | 'register'

// export function AuthPage() {
//   const { status, login, register } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation() as { state?: { from?: string } }

//   const [mode, setMode] = useState<Mode>('login')
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [busy, setBusy] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const redirectTo = useMemo(() => location.state?.from ?? '/dashboard', [location.state])

//   if (status === 'authed') return <Navigate to="/dashboard" replace />

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setError(null)
//     setBusy(true)
//     try {
//       if (mode === 'login') {
//         await login({ email: email.trim(), password })
//       } else {
//         await register({ name: name.trim(), email: email.trim(), password })
//       }
//       navigate(redirectTo, { replace: true })
//     } catch (err) {
//       setError(useFriendlyAuthError(err))
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-bg">
//       <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
//         {/* LEFT DECOR */}
//         <section className="relative hidden lg:block overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />

//           <div className="relative z-10 px-10 py-16">
//             <div className="max-w-md">
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
//                 <Sparkles className="h-4 w-4 text-indigo-200" />
//                 Gemini-powered RAG
//               </div>

//               <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white">
//                 Chat with your PDFs. Instantly.
//               </h1>
//               <p className="mt-3 text-base text-white/65">
//                 Upload any PDF and ask questions in plain English
//               </p>
//             </div>

//             <div className="relative mt-12 h-[340px]">
//               <div className="absolute left-0 top-10 w-[320px] dm-float dm-shine">
//                 <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(99,102,241,0.18)]">
//                   <div className="flex items-center justify-between">
//                     <div className="inline-flex items-center gap-2">
//                       <FileText className="h-4 w-4 text-indigo-200" />
//                       <div className="text-xs text-white/55">Sample Q&A</div>
//                     </div>
//                     <Sparkles className="h-4 w-4 text-indigo-500" />
//                   </div>
//                   <div className="mt-3 text-sm font-semibold">Q: What is the refund policy?</div>
//                   <div className="mt-1 text-sm text-white/62">
//                     A: Refunds are available within 30 days… (from the uploaded PDF)
//                   </div>
//                 </div>
//               </div>

//               <div className="absolute right-6 top-28 w-[320px] dm-float-delay dm-shine">
//                 <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(139,92,246,0.18)]">
//                   <div className="flex items-center justify-between">
//                     <div className="inline-flex items-center gap-2">
//                       <FileText className="h-4 w-4 text-purple-200" />
//                       <div className="text-xs text-white/55">Sample insights</div>
//                     </div>
//                     <Sparkles className="h-4 w-4 text-purple-500" />
//                   </div>
//                   <div className="mt-3 text-sm font-semibold">Q: Summarize this document.</div>
//                   <div className="mt-1 text-sm text-white/62">
//                     A: It covers strategy, risks, timelines, and next steps in detail…
//                   </div>
//                 </div>
//               </div>

//               <div className="absolute left-24 top-0 w-[280px] dm-float-delay-2 dm-shine">
//                 <div className="dm-card-soft rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(99,102,241,0.18)]">
//                   <div className="text-xs text-white/55">Trusted by teams that move fast</div>
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
//                       Secure
//                     </span>
//                     <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-200">
//                       RAG Powered
//                     </span>
//                     <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
//                       Gemini AI
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute bottom-10 left-10 right-10 flex flex-wrap items-center gap-3 opacity-90">
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
//                 <ShieldCheck className="h-4 w-4 text-indigo-200" />
//                 Secure cookies + JWT
//               </div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
//                 <Sparkles className="h-4 w-4 text-indigo-200" />
//                 Fast retrieval
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* RIGHT FORM */}
//         <section className="flex items-center justify-center p-6 lg:p-12">
//           <div className="w-full max-w-md">
//             <div className="mb-7 flex items-center justify-center lg:justify-start">
//               <Logo />
//             </div>

//             <div className="dm-card rounded-2xl p-5 md:p-7">
//               <div className="relative rounded-xl border border-white/10 bg-white/5 p-1">
//                 <div
//                   className={cn(
//                     'absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-lg bg-white/10 transition-transform duration-200',
//                     mode === 'register' ? 'translate-x-full' : 'translate-x-0',
//                   )}
//                 />

//                 <div className="grid grid-cols-2 relative z-10">
//                   <button
//                     type="button"
//                     onClick={() => setMode('login')}
//                     className={cn(
//                       'dm-ring rounded-lg px-3 py-2 text-sm transition-all duration-200',
//                       mode === 'login' ? 'text-white' : 'text-white/65 hover:text-white',
//                     )}
//                   >
//                     Login
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setMode('register')}
//                     className={cn(
//                       'dm-ring rounded-lg px-3 py-2 text-sm transition-all duration-200',
//                       mode === 'register' ? 'text-white' : 'text-white/65 hover:text-white',
//                     )}
//                   >
//                     Register
//                   </button>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h1 className="text-xl font-semibold text-white tracking-tight">
//                   {mode === 'login' ? 'Welcome back' : 'Create your account'}
//                 </h1>
//                 <p className="mt-1 text-sm text-white/60">
//                   {mode === 'login' ? 'Sign in to chat with your PDFs.' : 'Start uploading PDFs and ask questions.'}
//                 </p>
//               </div>

//               <form className="mt-6 space-y-4" onSubmit={onSubmit}>
//                 {mode === 'register' ? (
//                   <div className="space-y-2">
//                     <label className="text-xs text-white/55">Name</label>
//                     <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
//                   </div>
//                 ) : null}

//                 <div className="space-y-2">
//                   <label className="text-xs text-white/55">Email</label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/80" />
//                     <Input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       autoComplete="email"
//                       required
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs text-white/55">Password</label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/80" />
//                     <Input
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
//                       required
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>

//                 {error ? (
//                   <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
//                     {error}
//                   </div>
//                 ) : null}

//                 <Button type="submit" className="w-full h-11" loading={busy} disabled={busy}>
//                   {mode === 'login' ? 'Login' : 'Register'}
//                 </Button>

//                 <div className="text-xs text-white/40">
//                   By signing in you agree to our terms.
//                 </div>
//               </form>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   )
// }
import React, { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Sparkles, ShieldCheck, FileText } from 'lucide-react'
import { useAuth, useFriendlyAuthError } from '../state/auth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Logo } from '../ui/Logo'
import { cn } from '../ui/cn'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { status, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = useMemo(() => location.state?.from ?? '/dashboard', [location.state])

  if (status === 'authed') return <Navigate to="/dashboard" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password })
      } else {
        await register({ name: name.trim(), email: email.trim(), password })
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(useFriendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">

        {/* ───── LEFT DECOR ───── */}
        <section className="relative hidden lg:flex lg:flex-col overflow-hidden px-10 py-16">
          {/* background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

          {/* top text */}
          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Sparkles className="h-4 w-4 text-indigo-200" />
              Gemini-powered RAG
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white leading-tight">
              Chat with your PDFs. Instantly.
            </h1>
            <p className="mt-3 text-base text-white/65">
              Upload any PDF and ask questions in plain English
            </p>
          </div>

          {/* ── CARDS — no absolute positioning, stacked naturally ── */}
          <div className="relative z-10 mt-10 flex flex-col gap-4 max-w-sm">

            {/* Card 1 — Q&A */}
            <div className="dm-card-soft dm-float dm-shine rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(99,102,241,0.18)]">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-200" />
                  <span className="text-xs text-white/55">Sample Q&amp;A</span>
                </div>
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                Q: What is the refund policy?
              </div>
              <div className="mt-1 text-sm text-white/62">
                A: Refunds are available within 30 days… (from the uploaded PDF)
              </div>
            </div>

            {/* Card 2 — Insights */}
            <div className="dm-card-soft dm-float-delay dm-shine rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(139,92,246,0.18)]">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-200" />
                  <span className="text-xs text-white/55">Sample insights</span>
                </div>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                Q: Summarize this document.
              </div>
              <div className="mt-1 text-sm text-white/62">
                A: It covers strategy, risks, timelines, and next steps in detail…
              </div>
            </div>

            {/* Card 3 — Trust badges */}
            <div className="dm-card-soft dm-float-delay-2 dm-shine rounded-2xl p-4">
              <div className="text-xs text-white/55">Trusted by teams that move fast</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
                  Secure
                </span>
                <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-200">
                  RAG Powered
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                  Gemini AI
                </span>
              </div>
            </div>
          </div>

          {/* bottom trust row */}
          <div className="relative z-10 mt-auto pt-10 flex flex-wrap items-center gap-3 opacity-90">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 text-indigo-200" />
              Secure cookies + JWT
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <Sparkles className="h-4 w-4 text-indigo-200" />
              Fast retrieval
            </div>
          </div>
        </section>

        {/* ───── RIGHT FORM ───── */}
        <section className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center justify-center lg:justify-start">
              <Logo />
            </div>

            <div className="dm-card rounded-2xl p-5 md:p-7">
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-1">
                <div
                  className={cn(
                    'absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-lg bg-white/10 transition-transform duration-200',
                    mode === 'register' ? 'translate-x-full' : 'translate-x-0',
                  )}
                />
                <div className="grid grid-cols-2 relative z-10">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={cn(
                      'dm-ring rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      mode === 'login' ? 'text-white' : 'text-white/65 hover:text-white',
                    )}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={cn(
                      'dm-ring rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      mode === 'register' ? 'text-white' : 'text-white/65 hover:text-white',
                    )}
                  >
                    Register
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  {mode === 'login'
                    ? 'Sign in to chat with your PDFs.'
                    : 'Start uploading PDFs and ask questions.'}
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {mode === 'register' ? (
                  <div className="space-y-2">
                    <label className="text-xs text-white/55">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-xs text-white/55">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/80" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/55">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/80" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" className="w-full h-11" loading={busy} disabled={busy}>
                  {mode === 'login' ? 'Login' : 'Register'}
                </Button>

                <div className="text-xs text-white/40">
                  By signing in you agree to our terms.
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

