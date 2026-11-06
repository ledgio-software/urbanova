'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const ended = useSearchParams().get('ended')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(ended ? 'Your session has ended. Please log in again.' : null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('partner', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Wrong email or password, or your account is not active. Contact URBANOVA if you need help.')
    } else {
      router.push('/partner')
      router.refresh()
    }
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 px-4 py-3 text-sm font-body text-brand-white placeholder:text-white/20 focus:outline-none focus:border-white/40'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-body uppercase tracking-widest text-brand-white/50">Email</label>
        <input id="email" type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-body uppercase tracking-widest text-brand-white/50">Password</label>
        <input id="password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputClass} />
      </div>
      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-brand-red py-3 text-sm font-body uppercase tracking-widest text-white transition-colors hover:bg-brand-red/80 disabled:opacity-50">
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}

export default function PartnerLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-headline text-3xl uppercase tracking-widest text-brand-white">URBANOVA</h1>
          <p className="mt-1 text-sm font-body text-brand-white/40">Partner dashboard</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
