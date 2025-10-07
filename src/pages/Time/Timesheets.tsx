import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { listJobs, type JobOut, listMyTimeEntriesApi, type Paginated, type TimeEntryOut, clockInApi, breakStartApi, breakEndApi, clockOutApi, createManualEntryApi } from '../../lib/api'

export default function TimesheetsPage() {
  const [jobs, setJobs] = useState<JobOut[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [entries, setEntries] = useState<Paginated<TimeEntryOut>>({ items: [], total: 0, page: 1, size: 20 })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [jobsRes, entriesRes] = await Promise.all([
        listJobs({ active: true }),
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

  async function onClockIn() {
    if (!selectedJobId) { alert('Pick a job first'); return }
    try {
      await clockInApi({ job_id: selectedJobId })
      await load()
    } catch (e: any) {
      alert(e?.message || 'Clock-in failed')
    }
  }
  async function onBreakStart() {
    try { await breakStartApi(); await load() } catch (e: any) { alert(e?.message || 'Failed to start break') }
  }
  async function onBreakEnd() {
    try { await breakEndApi(); await load() } catch (e: any) { alert(e?.message || 'Failed to end break') }
  }
  async function onClockOut() {
    try { await clockOutApi(); await load() } catch (e: any) { alert(e?.message || 'Clock-out failed') }
  }

  // Manual entry form state
  const [mJobId, setMJobId] = useState<string>('')
  const [mStart, setMStart] = useState<string>('')
  const [mEnd, setMEnd] = useState<string>('')
  const [mBreak, setMBreak] = useState<number>(0)
  const [mNote, setMNote] = useState<string>('')

  async function onCreateManual(e: FormEvent) {
    e.preventDefault()
    if (!mJobId || !mStart || !mEnd) { alert('Fill all required fields'); return }
    try {
      setCreating(true)
      const start_iso = new Date(mStart).toISOString()
      const end_iso = new Date(mEnd).toISOString()
      await createManualEntryApi({ job_id: mJobId, start_ts: start_iso, end_ts: end_iso, break_minutes: mBreak || 0, note: mNote || undefined })
      setMNote(''); setMStart(''); setMEnd(''); setMBreak(0)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to create entry')
    } finally { setCreating(false) }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Timesheet</h1>
      </header>

      {/* Clock controls */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 space-y-3">
        {activeEntry ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm">
              <div>Active on job <span className="font-medium">{jobName(activeEntry.job_id)}</span></div>
              <div className="text-slate-500">Started at {activeEntry.start_ts ? new Date(activeEntry.start_ts).toLocaleString() : '—'} • Break: {activeEntry.break_minutes} min</div>
            </div>
            <div className="flex gap-2">
              {!onBreak ? (
                <button onClick={onBreakStart} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Start Break</button>
              ) : (
                <button onClick={onBreakEnd} className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">End Break</button>
              )}
              <button onClick={onClockOut} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 font-medium shadow-sm hover:bg-blue-700">Clock Out</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select className="rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>{j.name}{j.client_name ? ` – ${j.client_name}` : ''} • R{j.default_rate.toFixed(2)}/h</option>
              ))}
            </select>
            <button onClick={onClockIn} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 font-medium shadow-sm hover:bg-blue-700">Clock In</button>
          </div>
        )}
      </section>

      {/* Manual entry */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">Add Manual Entry</h2>
        <form onSubmit={onCreateManual} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-sm text-slate-500">Job</label>
            <select className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" value={mJobId} onChange={(e) => setMJobId(e.target.value)}>
              <option value="">Select job…</option>
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>{j.name}{j.client_name ? ` – ${j.client_name}` : ''}</option>
              ))}
            </select>
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
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
              <tr>
                <th className="px-3 py-2 text-left">Job</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
                <th className="px-3 py-2 text-left">Break</th>
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
                  <td className="px-3 py-2">{r.duration_minutes != null ? `${r.duration_minutes}m` : (r.is_active ? 'running' : '—')}</td>
                  <td className="px-3 py-2">{r.amount != null ? `R${Number(r.amount).toFixed(2)}` : (r.rate ? `R${Number(r.rate).toFixed(2)}/h` : '—')}</td>
                  <td className="px-3 py-2">{r.is_active ? (r.on_break ? 'On Break' : 'Active') : 'Done'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
