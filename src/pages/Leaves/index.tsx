import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { listLeaves, decideLeave, type LeaveOut } from '../../lib/api'

type Status = 'Pending' | 'Approved' | 'Rejected'
type UILeave = { id: number | string; employee: string; type: string; startDate: string; endDate: string; status: Status }

export default function LeavesPage() {
  const [tab, setTab] = useState<'All' | Status>('All')
  const [requests, setRequests] = useState<UILeave[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const statusParam = tab === 'All' ? undefined : tab.toLowerCase()
        const res = await listLeaves({ page: 1, size: 50, status: statusParam })
        if (!cancelled) setRequests(res.items.map(mapLeave))
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load leaves')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tab])

  const list = useMemo(() => {
    if (tab === 'All') return requests
    return requests.filter((r) => r.status === tab)
  }, [requests, tab])

  async function setStatus(id: number | string, status: Status) {
    try {
      const action = status === 'Approved' ? 'approve' as const : 'reject' as const
      const updated = await decideLeave(id, action)
      setRequests((prev) => prev.map((r) => (r.id === id ? mapLeave(updated) : r)))
    } catch (e) {
      alert('Failed to update leave status')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Leaves' }]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Leaves</h1>
            <p className="text-slate-600 dark:text-slate-300">Track leave requests and approvals.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 p-1 text-sm shadow-sm">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md ${tab === t ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-rose-600">{error}</td></tr>
              )}
              {!loading && !error && list.map((r) => (
                <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-3">{r.employee}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.startDate}</td>
                  <td className="px-4 py-3">{r.endDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                        : r.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-600/20 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setStatus(r.id, 'Approved')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                      <button onClick={() => setStatus(r.id, 'Rejected')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                      <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {loading && (
            <div className="text-center text-slate-500">Loading…</div>
          )}
          {!loading && !error && list.map((r) => (
            <div key={r.id} className="rounded-xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.employee}</div>
                  <div className="text-xs text-slate-500">{r.type} • {r.startDate} – {r.endDate}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  r.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                    : r.status === 'Pending'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-600/20 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                }`}>{r.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setStatus(r.id, 'Approved')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                <button onClick={() => setStatus(r.id, 'Rejected')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function mapLeave(l: LeaveOut): UILeave {
  const status: Status = (l.status === 'approved' ? 'Approved' : l.status === 'rejected' ? 'Rejected' : 'Pending')
  const start = typeof l.start_date === 'string' ? l.start_date : new Date(l.start_date).toISOString().slice(0,10)
  const end = typeof l.end_date === 'string' ? l.end_date : new Date(l.end_date).toISOString().slice(0,10)
  return {
    id: l.id,
    employee: `Employee #${l.employee_id}`,
    type: l.leave_type,
    startDate: start,
    endDate: end,
    status,
  }
}
