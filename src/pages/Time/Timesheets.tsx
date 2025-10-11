import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { listJobs, type JobOut, listMyTimeEntriesApi, type Paginated, type TimeEntryOut, clockInApi, breakStartApi, breakEndApi, clockOutApi, createManualEntryApi, getUser, pauseJobApi, resumeJobApi, abandonJobApi } from '../../lib/api'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useAlerts } from '../../components/AlertsProvider'
import { Skeleton } from '@heroui/react'

export default function TimesheetsPage() {
  const alerts = useAlerts()
  const [jobs, setJobs] = useState<JobOut[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [entries, setEntries] = useState<Paginated<TimeEntryOut>>({ items: [], total: 0, page: 1, size: 20 })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [jobsRes, entriesRes] = await Promise.all([
        listJobs({ active: true, assigned_to_me: !isAdminLike }),
        listMyTimeEntriesApi({ page: 1, limit: 20 }),
      ])
      setJobs(jobsRes)
      setEntries(entriesRes)
      if (!selectedJobId && jobsRes.length > 0) setSelectedJobId(String(jobsRes[0].id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeEntry = useMemo(() => entries.items.find((e) => e.is_active), [entries])
  const jobName = (id: string | number) => {
    const j = jobs.find((x) => String(x.id) === String(id))
    return j ? j.name : String(id)
  }
  const onBreak = !!activeEntry?.on_break
  const onPause = !!activeEntry?.on_pause
  const role = ((getUser() as any)?.role) || 'employee'
  const isAdminLike = ['admin','manager','hr'].includes(role)

  async function onClockIn() {
    if (!selectedJobId) { alerts.warning('Pick a job first'); return }
    try {
      await clockInApi({ job_id: selectedJobId })
      await load()
    } catch (e: any) {
      alerts.error(e?.message || 'Clock-in failed')
    }
  }
  async function onBreakStart() {
    try { await breakStartApi(); await load() } catch (e: any) { alerts.error(e?.message || 'Failed to start break') }
  }
  async function onBreakEnd() {
    try { await breakEndApi(); await load() } catch (e: any) { alerts.error(e?.message || 'Failed to end break') }
  }
  async function onClockOut() {
    try { await clockOutApi(); await load() } catch (e: any) { alerts.error(e?.message || 'Clock-out failed') }
  }
  async function onPauseClick() {
    const reason = window.prompt('Reason for pausing? (optional)') || undefined
    let resume_at: string | undefined
    const plan = window.prompt('Planned resume time? (optional, e.g., 2025-10-11 14:30)')
    if (plan && plan.trim()) {
      const parsed = new Date(plan)
      if (!isNaN(parsed.getTime())) resume_at = parsed.toISOString()
    }
    try { await pauseJobApi({ reason, resume_at }); await load() } catch (e: any) { alerts.error(e?.message || 'Failed to pause job') }
  }
  async function onResumeClick() {
    try { await resumeJobApi(); await load() } catch (e: any) { alerts.error(e?.message || 'Failed to resume job') }
  }
  async function onAbandonClick() {
    const reason = window.prompt('Reason for abandoning? (required)')
    if (!reason || !reason.trim()) { alerts.warning('A reason is required.'); return }
    try { await abandonJobApi({ reason: reason.trim() }); await load() } catch (e: any) { alerts.error(e?.message || 'Failed to abandon job') }
  }

  // Manual entry form state
  const [mJobId, setMJobId] = useState<string>('')
  const [mStart, setMStart] = useState<string>('')
  const [mEnd, setMEnd] = useState<string>('')
  const [mBreak, setMBreak] = useState<number>(0)
  const [mNote, setMNote] = useState<string>('')

  async function onCreateManual(e: FormEvent) {
    e.preventDefault()
    if (!mJobId || !mStart || !mEnd) { alerts.warning('Fill all required fields'); return }
    try {
      setCreating(true)
      const start_iso = new Date(mStart).toISOString()
      const end_iso = new Date(mEnd).toISOString()
      await createManualEntryApi({ job_id: mJobId, start_ts: start_iso, end_ts: end_iso, break_minutes: mBreak || 0, note: mNote || undefined })
      setMNote(''); setMStart(''); setMEnd(''); setMBreak(0)
      await load()
    } catch (e: any) {
      alerts.error(e?.message || 'Failed to create entry')
    } finally { setCreating(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Time' }]} />
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Timesheet</h1>
        </header>

      {/* Clock controls */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 space-y-3">
        {loading ? (
          <div className="space-y-3" aria-busy>
            <div className="animate-pulse">
              <Skeleton className="w-2/3 rounded"><div className="h-4 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
              <div className="mt-2"><Skeleton className="w-1/2 rounded"><div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton></div>
            </div>
            <div className="flex gap-2 animate-pulse">
              <Skeleton className="w-28 rounded"><div className="h-8 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
              <Skeleton className="w-28 rounded"><div className="h-8 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
              <Skeleton className="w-28 rounded"><div className="h-8 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
            </div>
          </div>
        ) : activeEntry ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm">
              <div>{onPause ? 'Paused on' : 'Active on'} job <span className="font-medium">{jobName(activeEntry.job_id)}</span></div>
              <div className="text-slate-500">Started at {activeEntry.start_ts ? new Date(activeEntry.start_ts).toLocaleString() : '—'} • Break: {activeEntry.break_minutes} min{activeEntry.paused_minutes != null ? ` • Paused: ${activeEntry.paused_minutes} min` : ''}{activeEntry.planned_resume_at ? ` • Resume: ${new Date(activeEntry.planned_resume_at).toLocaleString()}` : ''}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!onPause && (
                !onBreak ? (
                  <button onClick={onBreakStart} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Start Break</button>
                ) : (
                  <button onClick={onBreakEnd} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">End Break</button>
                )
              )}
              {!onPause ? (
                <button onClick={onPauseClick} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Pause Job</button>
              ) : (
                <button onClick={onResumeClick} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Resume Job</button>
              )}
              <button onClick={onAbandonClick} className="rounded-lg border text-rose-600 border-rose-200 dark:border-rose-900/40 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20">Abandon</button>
              <button onClick={onClockOut} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 font-medium shadow-sm hover:bg-blue-700">Clock Out</button>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select className="rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
              <option value="">Select job…</option>
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>{j.name}{j.client_name ? ` – ${j.client_name}` : ''} • R{j.default_rate.toFixed(2)}/h</option>
              ))}
            </select>
            <button onClick={onClockIn} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 font-medium shadow-sm hover:bg-blue-700">Start Job</button>
          </div>
        ) : (
          <div className="text-sm text-slate-600">No jobs available to clock into. {isAdminLike ? (<a className="text-blue-600 hover:underline" href="/time/jobs">Create job types</a>) : 'Please ask an admin to add job types.'}</div>
        )}
      </section>

      {/* Manual entry */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">Add Manual Entry</h2>
        <form onSubmit={onCreateManual} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-sm text-slate-500">Job</label>
            {jobs.length > 0 ? (
              <select className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mJobId} onChange={(e) => setMJobId(e.target.value)}>
                <option value="">Select job…</option>
                {jobs.map((j) => (
                  <option key={j.id} value={String(j.id)}>{j.name}{j.client_name ? ` – ${j.client_name}` : ''}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-slate-600">No job types yet. {isAdminLike ? (<a className="text-blue-600 hover:underline" href="/time/jobs">Create job types</a>) : 'Ask an admin to create job types.'}</div>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-500">Start</label>
            <input type="datetime-local" className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mStart} onChange={(e) => setMStart(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-500">End</label>
            <input type="datetime-local" className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mEnd} onChange={(e) => setMEnd(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-500">Break (minutes)</label>
            <input type="number" min={0} className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mBreak} onChange={(e) => setMBreak(Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-500">Note</label>
            <input type="text" placeholder="Optional note" className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mNote} onChange={(e) => setMNote(e.target.value)} />
          </div>
          <div className="md:col-span-2"><button disabled={creating} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50">Add Entry</button></div>
        </form>
      </section>

      {/* Entries list */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Entries</h2>
        {loading ? (
          <div className="space-y-2" aria-busy>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-3 animate-pulse">
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 rounded bg-black/10 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
              <tr>
                <th className="px-3 py-2 text-left">Job</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
                <th className="px-3 py-2 text-left">Break</th>
                <th className="px-3 py-2 text-left">Paused</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {entries.items.map((r) => (
                <tr key={String(r.id)}>
                  <td className="px-3 py-2">{jobName(r.job_id)}</td>
                  <td className="px-3 py-2">{r.start_ts ? new Date(r.start_ts).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2">{r.end_ts ? new Date(r.end_ts).toLocaleString() : (r.is_active ? '—' : '—')}</td>
                  <td className="px-3 py-2">{r.break_minutes}m</td>
                  <td className="px-3 py-2">{r.paused_minutes != null ? `${r.paused_minutes}m` : '0m'}</td>
                  <td className="px-3 py-2">{r.duration_minutes != null ? `${r.duration_minutes}m` : (r.is_active ? 'running' : '—')}</td>
                  <td className="px-3 py-2">{r.amount != null ? `R${Number(r.amount).toFixed(2)}` : (r.rate ? `R${Number(r.rate).toFixed(2)}/h` : '—')}</td>
                  <td className="px-3 py-2">{r.is_active ? (r.on_pause ? 'Paused' : (r.on_break ? 'On Break' : 'Active')) : (r.state === 'abandoned' ? 'Abandoned' : 'Done')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      </div>
    </div>
  )
}
