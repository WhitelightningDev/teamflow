import { useEffect, useState } from 'react'
import Breadcrumbs from '../../components/Breadcrumbs'
import { getProfile, updateProfile, type ProfileOut } from '../../lib/api'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ProfileOut>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const p = await getProfile()
        if (cancelled) return
        setForm(p)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function onSave() {
    try {
      setLoading(true)
      setError(null)
      await updateProfile({
        first_name: form.first_name || '',
        last_name: form.last_name || '',
        email: form.email || '',
        title: form.title || undefined,
        phone: form.phone || undefined,
        timezone: form.timezone || undefined,
      })
      alert('Profile saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  function set<K extends keyof ProfileOut>(key: K, value: ProfileOut[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile' }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          <button onClick={onSave} disabled={loading} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50">Save</button>
        </div>

        {error && <div className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</div>}

        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
          {loading && !form?.id ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First name</label>
                <input value={form.first_name || ''} onChange={(e) => set('first_name', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Last name</label>
                <input value={form.last_name || ''} onChange={(e) => set('last_name', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input value={form.title || ''} onChange={(e) => set('title', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Timezone</label>
                <input value={form.timezone || ''} onChange={(e) => set('timezone', e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

