import { useEffect, useMemo, useState } from 'react'
import Breadcrumbs from '../../components/Breadcrumbs'
import { getProfile, updateProfile, type ProfileOut, getUser, listDocuments, listLeaves, type DocumentOut, type LeaveOut, getEmployee, getMyEmployeeProfile, listProvinces, updateMyEmployeeProfile } from '../../lib/api'
import { FileText, CalendarDays, Phone, Mail, MapPin, User2, Briefcase } from 'lucide-react'
import { useAlerts } from '../../components/AlertsProvider'

type Tab = 'Overview' | 'Documents' | 'Leaves' | 'Edit Profile'

export default function ProfilePage() {
  const alerts = useAlerts()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ProfileOut>>({})
  const [tab, setTab] = useState<Tab>('Overview')

  // related data
  const [docs, setDocs] = useState<DocumentOut[]>([])
  const [leaves, setLeaves] = useState<LeaveOut[]>([])
  const [employment, setEmployment] = useState<any | null>(null)
  const [province, setProvince] = useState<string>('')
  const [provinces, setProvinces] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const p = await getProfile()
        const user = getUser()
        // parallel fetch of profile-adjacent data
        const [docsRes, leavesRes, meRes, provs] = await Promise.all([
          listDocuments(user?.id ? { page: 1, size: 50, employee_id: user.id as any } : { page: 1, size: 50 }),
          listLeaves({ page: 1, size: 50 }),
          getMyEmployeeProfile().catch(() => ({ user, employee: {} as any })),
          listProvinces().catch(() => []),
        ])
        let myLeaves = leavesRes.items
        if (user?.id) {
          myLeaves = myLeaves.filter((l: any) => String(l.employee_id) === String(user.id))
        }
        // Try fetching richer employment info if available
        let emp: any | null = null
        try {
          if (user?.id) emp = await getEmployee(user.id)
        } catch {}
        if (cancelled) return
        setForm(p)
        setDocs(docsRes.items)
        setLeaves(myLeaves)
        setEmployment(emp)
        setProvince((meRes.employee && (meRes.employee as any).province) || '')
        setProvinces(provs)
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
      // Update employee-specific fields (province)
      await updateMyEmployeeProfile({ province: province || undefined })
      alerts.success('Profile saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  function set<K extends keyof ProfileOut>(key: K, value: ProfileOut[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const user = getUser()
  const fullName = `${form.first_name || user?.first_name || ''} ${form.last_name || user?.last_name || ''}`.trim()
  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase() || 'U'
  const leavesThisYear = useMemo(() => {
    const y = new Date().getFullYear()
    return leaves.filter((l) => new Date(l.start_date as any).getFullYear() === y).length
  }, [leaves])
  const documentsCount = docs.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile' }]} />
        {/* Header card */}
        <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center font-semibold">{initials}</div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{fullName || 'My Profile'}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{employment?.title || form.title || '—'}</span>
                {employment?.manager_id ? (
                  <span className="inline-flex items-center gap-1"><User2 className="h-4 w-4" />Manager: {employment?.manager_name || `#${employment.manager_id}`}</span>
                ) : null}
                <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{form.email || user?.email}</span>
                {form.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{form.phone}</span>}
                {province && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{province}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTab('Edit Profile')} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Edit</button>
            </div>
          </div>
          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Documents" value={String(documentsCount)} Icon={FileText} color="text-blue-600" />
            <Stat label="Leaves this year" value={String(leavesThisYear)} Icon={CalendarDays} color="text-emerald-600" />
            <Stat label="Role" value={String(((user as any)?.role) || 'Employee')} Icon={Briefcase} color="text-violet-600" />
            <Stat label="Timezone" value={form.timezone || '—'} Icon={MapPin} color="text-amber-600" />
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Overview','Documents','Leaves','Edit Profile'] as Tab[]).map((t) => (
            <button key={t} className={`px-3 py-1.5 rounded-lg text-sm ${tab===t ? 'bg-blue-600 text-white' : 'border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {error && <div className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</div>}

        {tab === 'Overview' && (
          <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent documents */}
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Recent documents</span>
                  <a href="/documents" className="text-xs text-blue-600 hover:underline">View all</a>
                </div>
                {docs.length === 0 ? (
                  <div className="text-sm text-slate-500">No documents yet.</div>
                ) : (
                  <ul className="divide-y divide-black/5 dark:divide-white/10">
                    {docs.slice(0,5).map((d) => (
                      <li key={d.id} className="py-2 text-sm flex items-center justify-between">
                        <span className="truncate mr-3">{d.filename}</span>
                        <span className="text-xs text-slate-500">{d.uploaded_at ? new Date(d.uploaded_at as any).toLocaleDateString() : ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Recent leaves */}
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Recent leaves</span>
                  <a href="/leaves" className="text-xs text-blue-600 hover:underline">Request leave</a>
                </div>
                {leaves.length === 0 ? (
                  <div className="text-sm text-slate-500">No leave history.</div>
                ) : (
                  <ul className="divide-y divide-black/5 dark:divide-white/10">
                    {leaves.slice(0,5).map((l) => (
                      <li key={l.id} className="py-2 text-sm flex items-center justify-between">
                        <span className="truncate mr-3">{l.leave_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : l.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'}`}>{l.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'Documents' && (
          <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">My Documents</h2>
            {docs.length === 0 ? (
              <div className="text-sm text-slate-500">No documents uploaded yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 dark:bg-neutral-800/50 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Filename</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/10">
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-2">{d.filename}</td>
                        <td className="px-4 py-2">{d.category || '—'}</td>
                        <td className="px-4 py-2">{d.uploaded_at ? new Date(d.uploaded_at as any).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'Leaves' && (
          <section className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Leave History</h2>
              <a href="/leaves" className="text-sm text-blue-600 hover:underline">Request leave</a>
            </div>
            {leaves.length === 0 ? (
              <div className="text-sm text-slate-500">No leave requests yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 dark:bg-neutral-800/50 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">From</th>
                      <th className="px-4 py-2 font-medium">To</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/10">
                    {leaves.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-2">{l.leave_type}</td>
                        <td className="px-4 py-2">{l.start_date ? new Date(l.start_date as any).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2">{l.end_date ? new Date(l.end_date as any).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            l.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                              : l.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                          }`}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'Edit Profile' && (
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
            {loading && !form?.id ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : (
              <>
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
                <div>
                  <label className="block text-sm font-medium">Province</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={() => setTab('Overview')} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
                  <button onClick={async () => { await onSave(); setTab('Overview') }} disabled={loading} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50">Save</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import type { ComponentType } from 'react'

function Stat({ label, value, Icon, color = '' }: { label: string; value: string; Icon: ComponentType<{ className?: string }>; color?: string }) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 p-4 bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  )
}
