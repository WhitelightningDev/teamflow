import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { listJobs, type JobOut, createJobApi, updateJobApi, setJobRateApi, listJobRatesApi, type JobRateOut } from '../../lib/api'

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOut[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [rate, setRate] = useState<number>(0)

  async function load() {
    setLoading(true)
    try {
      const data = await listJobs()
      setJobs(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { alert('Name is required'); return }
    try {
      setCreating(true)
      await createJobApi({ name: name.trim(), client_name: client || undefined, default_rate: rate || 0, active: true })
      setName(''); setClient(''); setRate(0)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to create job')
    } finally { setCreating(false) }
  }

  async function toggleActive(job: JobOut) {
    try { await updateJobApi(job.id, { active: !job.active }); await load() } catch (e: any) { alert(e?.message || 'Failed to update') }
  }

  async function changeRate(job: JobOut) {
    const input = window.prompt('New default hourly rate (e.g., 250.00):', String(job.default_rate))
    if (!input) return
    const val = Number(input)
    if (!isFinite(val) || val < 0) { alert('Invalid rate'); return }
    try { await updateJobApi(job.id, { default_rate: val }); await load() } catch (e: any) { alert(e?.message || 'Failed to update rate') }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </header>

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">Create Job</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-slate-500">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" placeholder="Job name" />
          </div>
          <div>
            <label className="text-sm text-slate-500">Client</label>
            <input value={client} onChange={(e) => setClient(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" placeholder="Optional" />
          </div>
          <div>
            <label className="text-sm text-slate-500">Default Rate (R/h)</label>
            <input type="number" min={0} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" />
          </div>
          <div>
            <button disabled={creating} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50">Create</button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold mb-3">All Jobs</h2>
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Default Rate</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {jobs.map((j) => (
                <JobRow key={String(j.id)} job={j} onToggle={() => toggleActive(j)} onChangeRate={() => changeRate(j)} />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function JobRow({ job, onToggle, onChangeRate }: { job: JobOut; onToggle: () => void; onChangeRate: () => void }) {
  const [showRates, setShowRates] = useState(false)
  const [rates, setRates] = useState<JobRateOut[]>([])
  const [empId, setEmpId] = useState('')
  const [empRate, setEmpRate] = useState<number>(0)

  async function loadRates() {
    try { const data = await listJobRatesApi(job.id); setRates(data) } catch {}
  }
  useEffect(() => { if (showRates) loadRates() }, [showRates])

  async function saveRate(e: FormEvent) {
    e.preventDefault()
    if (!empId || empRate < 0) { alert('Provide employee ID and a non-negative rate'); return }
    try { await setJobRateApi(job.id, { employee_id: empId, rate: empRate }); setEmpId(''); setEmpRate(0); await loadRates() } catch (e: any) { alert(e?.message || 'Failed to set rate') }
  }

  return (
    <tr>
      <td className="px-3 py-2">{job.name}</td>
      <td className="px-3 py-2">{job.client_name || '—'}</td>
      <td className="px-3 py-2">R{job.default_rate.toFixed(2)}/h</td>
      <td className="px-3 py-2">{job.active ? 'Yes' : 'No'}</td>
      <td className="px-3 py-2 space-x-2">
        <button onClick={onToggle} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">{job.active ? 'Deactivate' : 'Activate'}</button>
        <button onClick={onChangeRate} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Change Rate</button>
        <button onClick={() => setShowRates((v) => !v)} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">{showRates ? 'Hide' : 'Rates'}</button>
        {showRates && (
          <div className="mt-2 space-y-2">
            <div className="text-xs text-slate-500">Per-employee rates</div>
            <ul className="text-xs">
              {rates.map((r) => (
                <li key={String(r.id)} className="py-0.5">Emp {String(r.employee_id)} → R{r.rate.toFixed(2)}/h</li>
              ))}
            </ul>
            <form onSubmit={saveRate} className="flex items-center gap-2">
              <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Employee ID" className="rounded-md border px-2 py-1 bg-white dark:bg-neutral-900" />
              <input type="number" min={0} value={empRate} onChange={(e) => setEmpRate(Number(e.target.value))} placeholder="Rate" className="w-28 rounded-md border px-2 py-1 bg-white dark:bg-neutral-900" />
              <button className="rounded-md bg-blue-600 text-white px-2 py-1">Set</button>
            </form>
          </div>
        )}
      </td>
    </tr>
  )
}
