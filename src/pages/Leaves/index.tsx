import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'

type Status = 'Pending' | 'Approved' | 'Rejected'

export default function LeavesPage() {
  const [tab, setTab] = useState<'All' | Status>('All')
  const [requests, setRequests] = useState(() => initialRequests)

  const list = useMemo(() => {
    if (tab === 'All') return requests
    return requests.filter((r) => r.status === tab)
  }, [requests, tab])

  function setStatus(id: string, status: Status) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
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
              {list.map((r) => (
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
          {list.map((r) => (
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

const initialRequests = [
  { id: '1', employee: 'Alex Johnson', type: 'Vacation', startDate: '2025-10-12', endDate: '2025-10-16', status: 'Pending' as Status },
  { id: '2', employee: 'Priya Patel', type: 'Sick Leave', startDate: '2025-10-03', endDate: '2025-10-05', status: 'Approved' as Status },
  { id: '3', employee: 'Sam Lee', type: 'Personal', startDate: '2025-10-20', endDate: '2025-10-21', status: 'Rejected' as Status },
  { id: '4', employee: 'Maria Garcia', type: 'Vacation', startDate: '2025-11-01', endDate: '2025-11-07', status: 'Pending' as Status },
]
