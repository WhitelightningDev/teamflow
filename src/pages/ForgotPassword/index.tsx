import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../lib/api'
import Logo from '../../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!/.+@.+\..+/.test(email)) return
    setLoading(true)
    try { await requestPasswordReset(email); setDone(true) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Logo height={120} /></Link>
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Enter your email and we'll send you a reset link.</p>
          {done ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-900/20 dark:text-emerald-300 px-3 py-2 text-sm">If an account exists for {email}, you’ll get an email with a reset link.</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
                {submitted && !/.+@.+\..+/.test(email) && <p className="text-xs text-rose-600">Enter a valid email.</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70">{loading ? 'Sending…' : 'Send reset link'}</button>
            </form>
          )}
          <p className="mt-4 text-sm"><Link to="/login" className="text-blue-600 hover:underline">Back to login</Link></p>
        </div>
      </div>
    </div>
  )
}

