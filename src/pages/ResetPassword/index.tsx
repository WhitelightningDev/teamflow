import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { performPasswordReset } from '../../lib/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) { setError('Missing token'); return }
    if (pw1.length < 8) { setError('Password must be at least 8 characters'); return }
    if (pw1 !== pw2) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await performPasswordReset(token, pw1)
      setDone(true)
      setTimeout(()=>navigate('/login'), 2000)
    } catch (e: any) {
      setError(e?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Logo height={120} /></Link>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          {done ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-900/20 dark:text-emerald-300 px-3 py-2 text-sm">Password updated. Redirecting to login…</div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">New password</label>
                <input type="password" value={pw1} onChange={(e)=>setPw1(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm new password</label>
                <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
              </div>
              {error && <div className="text-sm text-rose-600">{error}</div>}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70">{loading ? 'Updating…' : 'Set new password'}</button>
            </form>
          )}
          <p className="mt-4 text-sm"><Link to="/login" className="text-blue-600 hover:underline">Back to login</Link></p>
        </div>
      </div>
    </div>
  )
}

