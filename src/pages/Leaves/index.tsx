import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { listLeaves, updateLeaveStatus, createLeave, uploadDocument, getUser, type LeaveOut } from '../../lib/api'

type Status = 'Requested' | 'Approved' | 'Rejected'
type UILeave = { id: number | string; employee: string; type: string; startDate: string; endDate: string; status: Status; comment?: string }

export default function LeavesPage() {
  const role = (getUser() as any)?.role || 'employee'
  const canModerate = ['admin','manager','hr','supervisor'].includes(role)
  const canApply = ['employee','staff'].includes(role)
  const [tab, setTab] = useState<'All' | Status>('All')
  const [requests, setRequests] = useState<UILeave[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ type: 'annual', start: '', end: '', reason: '', half: false })
  const [createdLeaveId, setCreatedLeaveId] = useState<string | number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const statusParam = tab === 'All' ? undefined : (tab === 'Requested' ? 'requested' : tab.toLowerCase())
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
      const newStatus = status === 'Approved' ? 'approved' as const : 'rejected' as const
      let comment: string | undefined
      if (newStatus === 'rejected') {
        const input = window.prompt('Please provide a reason for rejection:')
        if (!input || !input.trim()) {
          alert('A rejection reason is required.')
          return
        }
        comment = input.trim()
      }
      const updated = await updateLeaveStatus(id, newStatus, comment)
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
          {(['All', 'Requested', 'Approved', 'Rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md ${tab === t ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {canApply && (
          <div className="mt-3">
            <button onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Request Leave</button>
          </div>
        )}

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
                <th className="px-4 py-3 font-medium">Reason (if rejected)</th>
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
                        : r.status === 'Requested'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-600/20 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{r.status === 'Rejected' ? (r.comment || '—') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {canModerate && (
                        <>
                          <button onClick={() => setStatus(r.id, 'Approved')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                          <button onClick={() => setStatus(r.id, 'Rejected')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                        </>
                      )}
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
                    : r.status === 'Requested'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-600/20 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                }`}>{r.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {canModerate && (
                  <>
                    <button onClick={() => setStatus(r.id, 'Approved')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                    <button onClick={() => setStatus(r.id, 'Rejected')} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                  </>
                )}
                <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
              </div>
              {r.status === 'Rejected' && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">Reason: {r.comment || '—'}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Request Leave</h2>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setCreating(true)
              setError(null)
              try {
                const created = await createLeave({ leave_type: form.type, start_date: form.start, end_date: form.end, reason: form.reason || undefined, half_day: form.half })
                setCreatedLeaveId(created.id)
                // reload list
                const res = await listLeaves({ page: 1, size: 50 })
                setRequests(res.items.map(mapLeave))
              } catch (err: any) {
                alert(err?.message || 'Failed to create leave')
              } finally {
                setCreating(false)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2">
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Start date</label>
                  <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">End date</label>
                  <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Reason (optional)</label>
                <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why are you taking leave?" className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.half} onChange={(e) => setForm({ ...form, half: e.target.checked })} className="h-4 w-4" />
                Half day
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setCreateOpen(false); setCreatedLeaveId(null) }} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">Close</button>
                <button type="submit" disabled={creating} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">{creating ? 'Submitting…' : (createdLeaveId ? 'Submitted' : 'Submit')}</button>
              </div>
              {createdLeaveId && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10">
                  <p className="text-sm mb-2">Attach supporting document (optional):</p>
                  <input type="file" onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try {
                      await uploadDocument(f, { leave_id: createdLeaveId, category: 'leave' })
                      alert('Document uploaded')
                    } catch (err: any) {
                      alert(err?.message || 'Upload failed')
                    }
                  }} />
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function mapLeave(l: LeaveOut): UILeave {
  const status: Status = (l.status === 'approved' ? 'Approved' : l.status === 'rejected' ? 'Rejected' : 'Requested')
  const start = typeof l.start_date === 'string' ? l.start_date : new Date(l.start_date).toISOString().slice(0,10)
  const end = typeof l.end_date === 'string' ? l.end_date : new Date(l.end_date).toISOString().slice(0,10)
  return {
    id: l.id,
    employee: `Employee #${l.employee_id}`,
    type: l.leave_type,
    startDate: start,
    endDate: end,
    status,
    comment: l.comment,
  }
}
