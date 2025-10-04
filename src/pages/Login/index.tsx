import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])
  const passwordValid = password.length >= 8
  const allValid = emailValid && passwordValid

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!allValid) return
    setError(null)
    setLoading(true)
    try {
      const auth = await apiLogin({ email, password })
      saveAuth(auth)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Form column */}
          <main className="order-1 lg:order-none">
            <div className="mx-auto max-w-lg">
              <div className="mb-6">
                <Link to="/" className="inline-flex items-center gap-2">
                  <span className="inline-block h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500"></span>
                  <span className="text-xl font-semibold tracking-tight">Teamflow</span>
                </Link>
                <h1 className="mt-6 text-3xl font-bold tracking-tight">Log in to Teamflow</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">Manage your employees, leaves, and documents.</p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white text-slate-900 dark:bg-neutral-900/60 dark:text-slate-100 px-4 py-2.5 shadow-sm hover:bg-black/5 dark:hover:bg-white/10">
                  <GoogleIcon className="h-5 w-5" />
                  <span>Continue with Google</span>
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white text-slate-900 dark:bg-neutral-900/60 dark:text-slate-100 px-4 py-2.5 shadow-sm hover:bg-black/5 dark:hover:bg-white/10">
                  <MicrosoftIcon className="h-5 w-5" />
                  <span>Continue with Microsoft</span>
                </button>
              </div>

              <div className="my-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                <span>or</span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && !emailValid && (
                    <p className="mt-1 text-xs text-rose-600">Invalid email format.</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Password</label>
                    <Link to="#" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && !passwordValid && (
                    <p className="mt-1 text-xs text-rose-600">Password too short — use at least 8 characters.</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 select-none text-sm">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-rose-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || (!allValid && submitted)}
                  className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Login'}
                </button>

                <p className="text-sm text-center">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
              </form>
            </div>
          </main>

          {/* Visual column */}
          <aside className="hidden lg:flex items-center">
            <div className="relative w-full">
              <div className="absolute -inset-8 bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-fuchsia-500/20 blur-2xl" aria-hidden></div>
              <div className="relative rounded-3xl bg-white/70 dark:bg-neutral-900/60 border border-black/5 dark:border-white/10 backdrop-blur p-6 shadow-xl">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">A peek at your dashboard</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Quick overview of people, leaves and docs.</p>
                </div>
                <div className="rounded-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden bg-white dark:bg-neutral-900">
                  {/* Simple mock UI */}
                  <div className="flex gap-2 p-3 bg-slate-100 dark:bg-neutral-800">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3">
                    <div className="col-span-3 h-10 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    <div className="col-span-1 h-24 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    <div className="col-span-1 h-24 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    <div className="col-span-1 h-24 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    <div className="col-span-2 h-32 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    <div className="col-span-1 h-32 rounded-lg bg-slate-100 dark:bg-neutral-800" />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.5-5.4 3.5-3.2 0-5.8-2.6-5.8-5.8S8.8 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c7 0 9.7-4.9 9.7-7.4 0-.5-.1-.9-.1-1.1H12z"/>
      <path fill="#34A853" d="M3.9 7.4l3.2 2.4C8 7.7 9.8 6.6 12 6.6c1.8 0 3 .8 3.7 1.5l2.5-2.5C16.8 3.6 14.6 2.7 12 2.7 8.7 2.7 5.9 4.2 3.9 7.4z" opacity=".1"/>
    </svg>
  )
}

function MicrosoftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="10" height="10" x="2" y="2" fill="#F25022" />
      <rect width="10" height="10" x="12" y="2" fill="#7FBA00" />
      <rect width="10" height="10" x="2" y="12" fill="#00A4EF" />
      <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
    </svg>
  )
}
