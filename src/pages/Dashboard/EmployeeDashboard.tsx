import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLeaves, listDocuments, getUser } from '../../lib/api'

export default function EmployeeDashboard() {
  const user = getUser()
  const userName = user ? user.first_name : 'User'
  const [myPending, setMyPending] = useState(0)
  const [myDocs, setMyDocs] = useState(0)
  const [recent, setRecent] = useState<{ id: string | number; event: string }[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [leavesReq, leavesAll, docs] = await Promise.all([
        listLeaves({ page: 1, size: 1, status: 'requested' }),
        listLeaves({ page: 1, size: 10 }),
        listDocuments({ page: 1, size: 10 }),
      ])
      if (!cancelled) {
        setMyPending(leavesReq.total)
        setMyDocs(docs.total)
        setRecent([
          ...leavesAll.items.map((l) => ({ id: `l-${l.id}`, event: `Leave ${l.status}` })),
          ...docs.items.map((d) => ({ id: `d-${d.id}`, event: `Uploaded ${d.filename}` })),
        ].slice(0, 10))
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
        <div className="flex gap-2">
          <Link to="/leaves" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700">Request Leave</Link>
          <Link to="/documents" className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Upload Document</Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPI label="My Pending Leaves" value={String(myPending)} />
        <KPI label="My Documents" value={String(myDocs)} />
      </section>

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">My Recent Activity</h2>
        {recent.length === 0 ? (
          <div className="text-sm text-slate-500">No recent activity.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {recent.map((a) => (
              <li key={a.id} className="rounded-lg border border-black/5 dark:border-white/10 px-3 py-2">{a.event}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

