import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLeaves, listDocuments, getUser, listMyAssignmentActivityApi, type AssignmentActivity, listMyAssignmentsApi, type MyAssignment } from '../../lib/api'
import { FileText, Calendar, Briefcase, CheckCircle2, XCircle, Play, ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@heroui/react'

export default function EmployeeDashboard() {
  const user = getUser()
  const userName = user ? user.first_name : 'User'
  const [myPending, setMyPending] = useState(0)
  const [myDocs, setMyDocs] = useState(0)
  const [recent, setRecent] = useState<{ id: string | number; event: string; kind: 'doc'|'leave'; when?: string; status?: string }[]>([])
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
          ...leavesAll.items.map((l) => ({ id: `l-${l.id}`, event: `Leave ${l.status}`, kind: 'leave' as const, status: l.status, when: l.start_date as any })),
          ...docs.items.map((d) => ({ id: `d-${d.id}`, event: `Uploaded ${d.filename}` , kind: 'doc' as const, when: d.uploaded_at as any })),
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">My Recent Activity</h2>
          <Link to="/activity" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-slate-500">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {recent.map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg ${a.kind === 'doc' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>
                  {a.kind === 'doc' ? <FileText className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">{a.event}</div>
                    <time className="text-xs text-slate-500">{a.when ? new Date(a.when).toLocaleString() : ''}</time>
                  </div>
                  {a.kind === 'leave' && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                          : a.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-600/20 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                      }`}>{a.status}</span>
                    </div>
                  )}
                </div>
              </li>
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
          <ul className="space-y-3 text-sm">
            {myAssignments.map((a) => {
              const state = a.state
              const color = state === 'done' ? 'text-emerald-600' : state === 'in_progress' ? 'text-blue-600' : state === 'canceled' ? 'text-rose-600' : 'text-slate-600'
              const bg = state === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/20' : state === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/20' : state === 'canceled' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-100 dark:bg-slate-800/60'
              const Icon = state === 'done' ? CheckCircle2 : state === 'in_progress' ? Play : state === 'canceled' ? XCircle : Briefcase
              const progress = state === 'done' ? 100 : state === 'in_progress' ? 60 : state === 'canceled' ? 0 : 20
              return (
                <li key={a.job_id} className="rounded-lg border border-black/5 dark:border-white/10 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <div className="font-medium truncate">{a.job_name || `Job #${a.job_id}`}</div>
                          {a.client_name && <div className="text-xs text-slate-500 truncate">{a.client_name}</div>}
                        </div>
                        <span className={`whitespace-nowrap text-xs px-2 py-0.5 rounded-full ${state === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : state === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : state === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'}`}>
                          {state === 'done' ? 'Done' : state === 'in_progress' ? 'In Progress' : state === 'canceled' ? 'Canceled' : 'Assigned'}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10">
                        <div className={`h-1.5 rounded-full ${state === 'done' ? 'bg-emerald-500' : state === 'in_progress' ? 'bg-blue-500' : state === 'canceled' ? 'bg-rose-400' : 'bg-slate-400'}`} style={{ width: `${progress}%` }} />
                      </div>
                      {a.state_changed_at && (
                        <div className="mt-1 text-xs text-slate-500">Updated {new Date(a.state_changed_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
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
          <ul className="divide-y divide-black/5 dark:divide-white/10 text-sm">
            {assignmentActivity.map((ev) => {
              const action = ev.action
              const color = action === 'done' ? 'text-emerald-600' : action === 'started' ? 'text-blue-600' : action === 'canceled' ? 'text-rose-600' : 'text-slate-600'
              const bg = action === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/20' : action === 'started' ? 'bg-blue-50 dark:bg-blue-900/20' : action === 'canceled' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-100 dark:bg-slate-800/60'
              const Icon = action === 'done' ? CheckCircle2 : action === 'started' ? Play : action === 'canceled' ? XCircle : Briefcase
              return (
                <li key={ev.id} className="py-3 flex items-start gap-3">
                  <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{action === 'assigned' ? 'Assigned to' : action === 'started' ? 'Started' : action === 'done' ? 'Completed' : action === 'canceled' ? 'Canceled' : action}</span>
                        {' '}<span className="text-slate-700 dark:text-slate-200">{ev.job_name || (ev.job_id ? `Job #${ev.job_id}` : 'a job')}</span>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              )
            })}
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
