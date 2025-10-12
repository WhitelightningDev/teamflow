import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { me, saveAuth, type AuthUser } from '../../lib/api'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const next = params.get('next') || '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!token) { setError('Missing token'); return }
      try {
        const user: AuthUser = await me(token)
        if (cancelled) return
        saveAuth({ user, token })
        navigate(next)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Sign-in failed')
      }
    }
    run()
    return () => { cancelled = true }
  }, [token, next, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-slate-600 dark:text-slate-300">{error ? error : 'Signing you in…'}</div>
    </div>
  )
}

