import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { listEmployees, listLeaves, listDocuments, getUser, updateLeaveStatus } from '../../lib/api'
import { useAlerts } from '../../components/AlertsProvider'
import SummarySkeleton from '../../components/SummarySkeleton'
import { listCompanyAssignmentsApi, type CompanyAssignment } from '../../lib/api'
import { FeatureFlags } from '../../lib/featureFlags'
import { getAssignmentDetails } from '../../lib/api'
import AlertsWidget from './components/AlertsWidget'
import TrendsWidget from './components/TrendsWidget'
import ScorecardsWidget from './components/ScorecardsWidget'
import DrilldownModal from './components/DrilldownModal'
import ExportButton from './components/ExportButton'

type SummaryCard = {
  key: string
  label: string
  value: string
  sublabel: string
  color: string
  Icon: (props: { className?: string }) => JSX.Element
}

export default function AdminDashboard() {
  const alerts = useAlerts()
  const user = getUser()
  const userName = user ? user.first_name : 'User'

  const [summary, setSummary] = useState<SummaryCard[]>([
    { key: 'employees', label: 'Employees', value: '—', sublabel: 'Total team members', color: 'text-blue-600', Icon: UsersIcon },
    { key: 'pending', label: 'Pending Leave', value: '—', sublabel: 'Awaiting approval', color: 'text-emerald-600', Icon: CalendarIcon },
    { key: 'docs', label: 'Documents', value: '—', sublabel: 'Uploaded this week', color: 'text-violet-600', Icon: FileIcon },
    { key: 'onLeave', label: 'On Leave Today', value: '—', sublabel: 'Team members out', color: 'text-amber-600', Icon: SunIcon },
  ])
  const [pending, setPending] = useState<{ id: string | number; text: string }[]>([])
  const [recent, setRecent] = useState<{ id: string | number; name: string; event: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)
  const [assignByState, setAssignByState] = useState<{
    assigned: CompanyAssignment[]
    in_progress: CompanyAssignment[]
    done: CompanyAssignment[]
    canceled: CompanyAssignment[]
  }>({ assigned: [], in_progress: [], done: [], canceled: [] })
  const [cancelReasons, setCancelReasons] = useState<Record<string, { label: string; note?: string }>>({})
  const [viewing, setViewing] = useState<{ job_id: string; employee_id: string } | null>(null)
  const [details, setDetails] = useState<any | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [drillMetric, setDrillMetric] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [emps, leaves, docs] = await Promise.all([
          listEmployees({ page: 1, size: 1 }),
          listLeaves({ page: 1, size: 5, status: 'requested' }),
          listDocuments({ page: 1, size: 5 }),
        ])
        if (!cancelled) {
          setSummary((prev) => prev.map((c) => {
            if (c.key === 'employees') return { ...c, value: String(emps.total) }
            if (c.key === 'pending') return { ...c, value: String(leaves.total) }
            if (c.key === 'docs') return { ...c, value: String(docs.total) }
            if (c.key === 'onLeave') return { ...c, value: '0' }
            return c
          }))
          setPending(leaves.items.map((l) => ({ id: l.id, text: `Leave #${l.id} (${l.leave_type})` })))
          setRecent([
            ...docs.items.map((d) => ({ id: `d-${d.id}`, name: 'Document', event: `uploaded ${d.filename}` })),
            ...leaves.items.map((l) => ({ id: `l-${l.id}`, name: 'Leave', event: `requested ${l.leave_type}` })),
          ].slice(0, 10))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
      // Load assignments snapshot (separated by state)
      setAssignmentsLoading(true)
      try {
        const [assigned, in_progress, done, canceled] = await Promise.all([
          listCompanyAssignmentsApi({ state: 'assigned', page: 1, limit: 10 }).catch(() => ({ items: [] as CompanyAssignment[] })),
          listCompanyAssignmentsApi({ state: 'in_progress', page: 1, limit: 10 }).catch(() => ({ items: [] as CompanyAssignment[] })),
          listCompanyAssignmentsApi({ state: 'done', page: 1, limit: 10 }).catch(() => ({ items: [] as CompanyAssignment[] })),
          listCompanyAssignmentsApi({ state: 'canceled', page: 1, limit: 10 }).catch(() => ({ items: [] as CompanyAssignment[] })),
        ])
        if (!cancelled) setAssignByState({
          assigned: assigned.items,
          in_progress: in_progress.items,
          done: done.items,
          canceled: canceled.items,
        })
        // Preload cancel/abandon reasons for canceled assignments
        try {
          const entries = await Promise.allSettled(
            (canceled.items || []).slice(0, 10).map(async (a) => {
              const det = await getAssignmentDetails(String(a.job_id), String(a.employee_id))
              const last = [...(det.timeline || [])].reverse().find((t) => ['canceled', 'abandoned', 'unassigned'].includes(String(t.action)))
              if (!last) return null
              return { key: `${a.job_id}-${a.employee_id}`, label: String(last.action), note: last.note || undefined }
            })
          )
          if (!cancelled) {
            const rec: Record<string, { label: string; note?: string }> = {}
            for (const e of entries) {
              if (e.status === 'fulfilled' && e.value && e.value.key) rec[e.value.key] = { label: e.value.label, note: e.value.note }
            }
            setCancelReasons(rec)
          }
        } catch {}
      } finally {
        if (!cancelled) setAssignmentsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadDetails() {
      if (!viewing) return
      setDetailsLoading(true)
      try {
        const res = await getAssignmentDetails(viewing.job_id, viewing.employee_id)
        if (!cancelled) setDetails(res)
      } catch {}
      finally {
        if (!cancelled) setDetailsLoading(false)
      }
    }
    loadDetails()
    return () => { cancelled = true }
  }, [viewing])

  async function refreshPending() {
    const leaves = await listLeaves({ page: 1, size: 5, status: 'requested' })
    setPending(leaves.items.map((l) => ({ id: l.id, text: `Leave #${l.id} (${l.leave_type})` })))
  }

  async function onApprove(id: string | number) {
    try {
      await updateLeaveStatus(id, 'approved')
      await refreshPending()
    } catch (e) {
      alerts.error('Failed to approve leave')
    }
  }

  async function onReject(id: string | number) {
    try {
      const input = window.prompt('Please provide a reason for rejection:')
      if (!input || !input.trim()) {
        alerts.warning('A rejection reason is required.')
        return
      }
      await updateLeaveStatus(id, 'rejected', input.trim())
      await refreshPending()
    } catch (e) {
      alerts.error('Failed to reject leave')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
        <div className="flex gap-2">
          <Link to="/employees" className="rounded-lg bg-blue-600 !text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700 hover:!text-white">Invite Employee</Link>
          {FeatureFlags.DASHBOARD_EXPORT ? <ExportButton /> : null}
        </div>
      </header>

      {FeatureFlags.DASHBOARD_ALERTS ? <AlertsWidget /> : null}

      {/* KPIs */}
      {loading ? (
        <SummarySkeleton items={4} />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {summary.map(({ key, label, value, sublabel, color, Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm"
              onClick={() => {
                if (FeatureFlags.DASHBOARD_DRILLDOWN && key === 'pending') setDrillMetric('pending_leaves')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' && FeatureFlags.DASHBOARD_DRILLDOWN && key === 'pending') setDrillMetric('pending_leaves') }}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="text-2xl font-semibold">{value}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">{sublabel}</div>
            </div>
          ))}
        </section>
      )}

      {FeatureFlags.DASHBOARD_TRENDS ? <TrendsWidget /> : null}

      {/* Pending Actions */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pending Actions</h2>
          <Link to="/leaves" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {pending.length === 0 ? (
          <div className="text-sm text-slate-500">No pending requests.</div>
        ) : (
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm rounded-lg border border-black/5 dark:border-white/10 px-3 py-2">
                <span>{p.text}</span>
                <div className="flex gap-2">
                  <button onClick={() => onApprove(p.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                  <button onClick={() => onReject(p.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Activity */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link to="/activity" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-slate-500">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={userName} size="sm" />
                <div className="flex-1 text-sm">
                  {a.name} {a.event}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {FeatureFlags.DASHBOARD_SCORECARDS ? <ScorecardsWidget /> : null}

      {/* Assignments by State */}
      <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Assignments by State</h2>
          <Link to="/time/jobs" className="text-sm text-blue-600 hover:underline">Manage jobs</Link>
        </div>
        {assignmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" aria-busy>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-black/5 dark:border-white/10 p-4">
                <div className="h-4 w-24 rounded bg-black/10 dark:bg-white/10 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-8 rounded bg-black/10 dark:bg-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {(
              [
                { key: 'assigned', title: 'Assigned', items: assignByState.assigned },
                { key: 'in_progress', title: 'In Progress', items: assignByState.in_progress },
                { key: 'done', title: 'Completed', items: assignByState.done },
                { key: 'canceled', title: 'Canceled/Abandoned', items: assignByState.canceled },
              ] as { key: string; title: string; items: CompanyAssignment[] }[]
            ).map(({ key, title, items }) => (
              <div key={key} className={`rounded-2xl p-4 ring-1 ring-black/5 dark:ring-white/10 ${
                key === 'done' ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent' :
                key === 'in_progress' ? 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-transparent' :
                key === 'canceled' ? 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/10 dark:to-transparent' :
                'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/30 dark:to-transparent'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{title}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    key === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' :
                    key === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' :
                    key === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
                  }`}>{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <div className="text-sm text-slate-500">None</div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {items.map((a) => (
                      <li key={`${a.job_id}-${a.employee_id}`} className="rounded-xl border border-black/5 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-neutral-900/70">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full ${
                            key === 'done' ? 'bg-emerald-500' : key === 'in_progress' ? 'bg-blue-500' : key === 'canceled' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate">
                                <div className="font-medium truncate">{a.job_name || `Job #${a.job_id}`}</div>
                                <div className="text-xs text-slate-500 truncate">{a.client_name ? `${a.client_name} • ` : ''}{a.employee_name || `Employee #${a.employee_id}`}</div>
                              </div>
                              <button onClick={() => setViewing({ job_id: String(a.job_id), employee_id: String(a.employee_id) })} className="shrink-0 rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">Details</button>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {a.last_activity_at ? new Date(a.last_activity_at).toLocaleDateString() : ''}
                            </div>
                            {key === 'canceled' && (
                              (() => { const r = cancelReasons[`${a.job_id}-${a.employee_id}`]; return (
                                <div className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                                  {r ? `${r.label.charAt(0).toUpperCase()}${r.label.slice(1)}${r.note ? ` — ${r.note}` : ''}` : 'Reason unavailable'}
                                </div>
                              )})()
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Assignment details modal */}
      {viewing && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setViewing(null); setDetails(null) }} />
          <div className="absolute inset-x-0 top-8 sm:top-12 mx-4 sm:mx-auto max-w-4xl w-[calc(100%-2rem)] sm:w-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg max-h-[85vh] overflow-y-auto overscroll-contain">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
              <div className="text-sm">
                <div className="font-semibold">Assignment Details</div>
                {details && (
                  <div className="text-slate-500">{details.job?.name || details.job?.id} — {details.employee?.name || details.employee?.id}</div>
                )}
              </div>
              <button className="h-8 w-8 rounded-md hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center" onClick={() => { setViewing(null); setDetails(null) }} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" /></svg>
              </button>
            </div>
            <div className="p-4">
              {detailsLoading ? (
                <div className="text-sm text-slate-500">Loading…</div>
              ) : details ? (
                (() => {
                  const st = String(details.assignment?.state || 'assigned')
                  const headerCls = st === 'done'
                    ? 'from-emerald-50 via-emerald-100/40 to-transparent dark:from-emerald-900/20'
                    : st === 'in_progress'
                    ? 'from-blue-50 via-blue-100/40 to-transparent dark:from-blue-900/20'
                    : st === 'canceled'
                    ? 'from-rose-50 via-rose-100/40 to-transparent dark:from-rose-900/20'
                    : 'from-slate-50 via-slate-100/40 to-transparent dark:from-slate-800/30'
                  const badge = st === 'done'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                    : st === 'in_progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                    : st === 'canceled'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
                  const reasonEv = [...(details.timeline || [])].reverse().find((t: any) => ['canceled', 'abandoned', 'unassigned'].includes(String(t.action)))
                  const reasonText = reasonEv ? `${String(reasonEv.action).charAt(0).toUpperCase()}${String(reasonEv.action).slice(1)}${reasonEv.note ? ' — ' + reasonEv.note : ''}` : ''
                  return (
                    <div className="space-y-5 text-sm">
                      {/* Header */}
                      <div className={`rounded-xl ring-1 ring-black/5 dark:ring-white/10 p-4 bg-gradient-to-r ${headerCls}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs text-slate-500">Job</div>
                            <div className="text-base font-semibold truncate">{details.job?.name || details.job?.id}</div>
                            <div className="text-xs text-slate-500 truncate">Employee: {details.employee?.name || details.employee?.id}</div>
                          </div>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${badge}`}>{st.replace('_', ' ')}</span>
                        </div>
                        {reasonText && (
                          <div className="mt-2 text-xs text-rose-600 dark:text-rose-300">{reasonText}</div>
                        )}
                        {details.assignment?.state_changed_at && (
                          <div className="mt-1 text-xs text-slate-500">Updated {new Date(details.assignment.state_changed_at).toLocaleString()}</div>
                        )}
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatSmall label="Entries" value={String(details.totals?.entries ?? 0)} />
                        <StatSmall label="Minutes" value={`${details.totals?.minutes ?? 0}m`} />
                        <StatSmall label="Paused" value={`${details.totals?.paused_minutes ?? 0}m`} />
                        <StatSmall label="Amount" value={`R${Number(details.totals?.amount || 0).toFixed(2)}`} />
                      </div>

                      {/* Body */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Timeline */}
                        <div>
                          <div className="font-semibold mb-2">Timeline</div>
                          {details.timeline?.length ? (
                            <ul className="relative pl-4 before:absolute before:left-1 before:top-0 before:bottom-0 before:w-px before:bg-black/10 dark:before:bg-white/10">
                              {details.timeline.map((ev: any, idx: number) => {
                                const color = ev.action === 'done' ? 'bg-emerald-500' : ev.action === 'started' ? 'bg-blue-500' : ev.action === 'canceled' ? 'bg-rose-500' : ev.action === 'abandoned' ? 'bg-rose-500' : 'bg-slate-400'
                                return (
                                  <li key={idx} className="relative py-2">
                                    <span className={`absolute left-0 top-3 h-2 w-2 rounded-full ${color}`} />
                                    <div className="ml-3">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium capitalize">{String(ev.action).replace('_',' ')}</div>
                                        <div className="text-xs text-slate-500">{ev.created_at ? new Date(ev.created_at).toLocaleString() : ''}</div>
                                      </div>
                                      {(ev.actor_name || ev.note) && (
                                        <div className="mt-1 text-xs text-slate-500">{ev.actor_name ? `By ${ev.actor_name}` : ''}{ev.actor_name && ev.note ? ' • ' : ''}{ev.note || ''}</div>
                                      )}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          ) : <div className="text-slate-500 text-sm">No activity.</div>}
                        </div>

                        {/* Entries */}
                        <div>
                          <div className="font-semibold mb-2">Entries</div>
                          {details.entries?.length ? (
                            <div className="overflow-x-auto rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
                                  <tr>
                                    <th className="px-2 py-1 text-left">Start</th>
                                    <th className="px-2 py-1 text-left">End</th>
                                    <th className="px-2 py-1 text-left">Break</th>
                                    <th className="px-2 py-1 text-left">Paused</th>
                                    <th className="px-2 py-1 text-left">Duration</th>
                                    <th className="px-2 py-1 text-left">State</th>
                                    <th className="px-2 py-1 text-left">Reason</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                  {details.entries.map((e: any) => (
                                    <tr key={e.id}>
                                      <td className="px-2 py-1">{e.start_ts ? new Date(e.start_ts).toLocaleString() : ''}</td>
                                      <td className="px-2 py-1">{e.end_ts ? new Date(e.end_ts).toLocaleString() : (e.is_active ? '—' : '')}</td>
                                      <td className="px-2 py-1">{e.break_minutes}m</td>
                                      <td className="px-2 py-1">{e.paused_minutes || 0}m</td>
                                      <td className="px-2 py-1">{e.duration_minutes != null ? `${e.duration_minutes}m` : (e.is_active ? 'running' : '—')}</td>
                                      <td className="px-2 py-1 capitalize">{String(e.state).replace('_',' ')}</td>
                                      <td className="px-2 py-1">{e.state === 'paused' ? e.pause_reason : e.state === 'abandoned' ? (e.abandoned_reason || '—') : (e.note || '—')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <div className="text-slate-500 text-sm">No entries.</div>}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="text-sm text-slate-500">No details.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {FeatureFlags.DASHBOARD_DRILLDOWN && drillMetric ? (
        <DrilldownModal metric={drillMetric} onClose={() => setDrillMetric(null)} />
      ) : null}
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const sizeCls = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
  return <div className={`${sizeCls} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center font-semibold`}>{initials}</div>
}

function UsersIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-7 8a7 7 0 0 1 14 0v1H5z" /></svg>) }
function CalendarIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1m10 5H7v2h10zM4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" /></svg>) }
function FileIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" /></svg>) }
function SunIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0-5h1v3h-1zm0 17h1v3h-1zM1 11h3v1H1zm19 0h3v1h-3zM4.22 4.22l.71-.71 2.12 2.12-.71.71zM16.95 16.95l.71-.71 2.12 2.12-.71.71zM4.22 19.78l2.12-2.12.71.71-2.12 2.12zM16.95 7.05l2.12-2.12.71.71-2.12 2.12z" /></svg>) }

function StatSmall({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg ring-1 ring-black/5 dark:ring-white/10 p-3 bg-white/70 dark:bg-neutral-900/60">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
