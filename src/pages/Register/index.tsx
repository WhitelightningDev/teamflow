import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister, saveAuth } from '../../lib/api'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])
  const passwordStrength = useMemo(() => assessPassword(password), [password])
  const passwordValid = passwordStrength.level !== 'weak'

  const allValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    company.trim().length > 0 &&
    emailValid &&
    passwordValid &&
    agree

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!allValid) return
    setError(null)
    setLoading(true)
    try {
      const auth = await apiRegister({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        company_name: company,
      })
      saveAuth(auth)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
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
                <h1 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">Start streamlining HR for your team today.</p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white text-slate-900 dark:bg-neutral-900/60 dark:text-slate-100 px-4 py-2.5 shadow-sm hover:bg-black/5 dark:hover:bg-white/10">
                  <GoogleIcon className="h-5 w-5" />
                  <span>Sign up with Google</span>
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white text-slate-900 dark:bg-neutral-900/60 dark:text-slate-100 px-4 py-2.5 shadow-sm hover:bg-black/5 dark:hover:bg-white/10">
                  <MicrosoftIcon className="h-5 w-5" />
                  <span>Sign up with Microsoft</span>
                </button>
              </div>

              <div className="my-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                <span>or continue with email</span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>

              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && firstName.trim().length === 0 && (
                    <p className="mt-1 text-xs text-rose-600">Please enter your first name.</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && lastName.trim().length === 0 && (
                    <p className="mt-1 text-xs text-rose-600">Please enter your last name.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Co."
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && company.trim().length === 0 && (
                    <p className="mt-1 text-xs text-rose-600">Please enter your company.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {submitted && !emailValid && (
                    <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 pr-24 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className={`mt-1 text-xs ${passwordStrength.color}`}>
                    {password ? passwordStrength.message : 'Use 8+ chars with a mix of letters and numbers.'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-start gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      I agree to the{' '}
                      <a className="text-blue-600 hover:underline" href="#">Terms</a>
                      {' '} & {' '}
                      <a className="text-blue-600 hover:underline" href="#">Privacy Policy</a>
                    </span>
                  </label>
                  {submitted && !agree && (
                    <p className="mt-1 text-xs text-rose-600">You must agree to continue.</p>
                  )}
                </div>

                {error && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-rose-600">{error}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={loading || (!allValid && submitted)}
                    className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account…' : 'Sign Up'}
                  </button>
                </div>

                <div className="sm:col-span-2 text-sm text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
                </div>
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
                  <p className="text-sm text-slate-600 dark:text-slate-300">Friendly UI to manage people, leaves, and docs.</p>
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

function assessPassword(pw: string): { level: 'weak' | 'medium' | 'strong'; message: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (score >= 4 && pw.length >= 10) {
    return { level: 'strong', message: 'Strong password', color: 'text-emerald-600' }
  } else if (score >= 3) {
    return { level: 'medium', message: 'Looks good — add more variety for extra strength', color: 'text-amber-600' }
  }
  return { level: 'weak', message: 'Weak — use 8+ chars with numbers and uppercase letters', color: 'text-rose-600' }
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
