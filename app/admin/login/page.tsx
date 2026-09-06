'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid username or password.')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-headline text-3xl tracking-widest text-brand-white uppercase">URBANOVA</h1>
          <p className="text-brand-white/40 text-sm font-body mt-1">Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-body uppercase tracking-widest text-brand-white/50 mb-2">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              autoComplete="username"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm font-body text-brand-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="block text-xs font-body uppercase tracking-widest text-brand-white/50 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm font-body text-brand-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
            />
          </div>

          {error && <p className="text-brand-red text-sm font-body">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red text-white font-body text-sm uppercase tracking-widest py-3 hover:bg-brand-red/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
