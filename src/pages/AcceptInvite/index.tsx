import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { acceptInvite, saveAuth } from '../../lib/api'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) setError('Missing invite token')
  }, [token])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) return setError('Missing invite token')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    try {
      setLoading(true)
      const auth = await acceptInvite({ token, password })
      saveAuth(auth)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="inline-block h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500"></span>
          <span className="text-xl font-semibold tracking-tight">Teamflow</span>
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Accept Invite</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">Create your password to activate your account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm password</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <button type="submit" disabled={loading || !token} className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70">
            {loading ? 'Activating…' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

