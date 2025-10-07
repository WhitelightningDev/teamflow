import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLeaves, listDocuments, getUser, listMyAssignmentActivityApi, type AssignmentActivity, listMyAssignmentsApi, type MyAssignment } from '../../lib/api'
import { Skeleton } from '@heroui/react'

export default function EmployeeDashboard() {
  const user = getUser()
  const userName = user ? user.first_name : 'User'
  const [myPending, setMyPending] = useState(0)
  const [myDocs, setMyDocs] = useState(0)
  const [recent, setRecent] = useState<{ id: string | number; event: string }[]>([])
  const [assignmentActivity, setAssignmentActivity] = useState<AssignmentActivity[]>([])
  const [myAssignments, setMyAssignments] = useState<MyAssignment[]>([])
  const [assignLoading, setAssignLoading] = useState(true)

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
      setAssignLoading(true)
      try {
        const [assignFeed, assignments] = await Promise.all([
          listMyAssignmentActivityApi({ page: 1, limit: 10 }).catch(() => ({ items: [] as AssignmentActivity[] })),
          listMyAssignmentsApi().catch(() => ({ items: [] as MyAssignment[] })),
        ])
        if (!cancelled) {
          setAssignmentActivity(assignFeed.items || [])
          setMyAssignments(assignments.items || [])
        }
      } finally {
        if (!cancelled) setAssignLoading(false)
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
          <Link to="/leaves" className="rounded-lg bg-blue-600 !text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700">Request Leave</Link>
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

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">My Jobs</h2>
        {assignLoading ? (
          <ul className="space-y-2" aria-busy>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="rounded-lg border border-black/5 dark:border-white/10 px-3 py-2">
                <div className="flex items-center justify-between animate-pulse">
                  <Skeleton className="w-1/2 rounded"><div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                  <Skeleton className="w-16 rounded"><div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                </div>
              </li>
            ))}
          </ul>
        ) : myAssignments.length === 0 ? (
          <div className="text-sm text-slate-500">No assigned jobs.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {myAssignments.map((a) => (
              <li key={a.job_id} className="rounded-lg border border-black/5 dark:border-white/10 px-3 py-2 flex items-center justify-between">
                <span>{a.job_name || `Job #${a.job_id}`}{a.client_name ? ` — ${a.client_name}` : ''}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.state === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' : a.state === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : a.state === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'}`}>
                  {a.state === 'done' ? 'Done' : a.state === 'in_progress' ? 'In Progress' : a.state === 'canceled' ? 'Canceled' : 'Assigned'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Job Assignment Activity</h2>
        {assignLoading ? (
          <ul className="space-y-2" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="rounded-lg border border-black/5 dark:border-white/10 px-3 py-2">
                <div className="flex items-center justify-between animate-pulse">
                  <Skeleton className="w-1/2 rounded"><div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                  <Skeleton className="w-1/4 rounded"><div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                </div>
              </li>
            ))}
          </ul>
        ) : assignmentActivity.length === 0 ? (
          <div className="text-sm text-slate-500">No assignment activity yet.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {assignmentActivity.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-black/5 dark:border-white/10 px-3 py-2 flex items-center justify-between">
                <span>
                  {ev.action === 'assigned' ? 'Assigned to' : ev.action === 'started' ? 'Started' : ev.action === 'done' ? 'Completed' : ev.action === 'canceled' ? 'Canceled' : ev.action}
                  {' '}{ev.job_name || (ev.job_id ? `Job #${ev.job_id}` : 'a job')}
                </span>
                <span className="text-xs text-slate-500">{new Date(ev.created_at).toLocaleString()}</span>
              </li>
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
