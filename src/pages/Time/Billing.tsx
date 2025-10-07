import { useEffect, useState } from 'react'
import { billingReportApi, listJobs, type JobOut } from '../../lib/api'

type JobSummary = {
  job_id: string
  job_name: string
  client_name?: string | null
  minutes: number
  hours: number
  amount: number
  by_employee: { employee_id: string; minutes: number; rate: number; amount: number }[]
}

export default function BillingPage() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7))
  const [jobs, setJobs] = useState<JobOut[]>([])
  const [jobId, setJobId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<JobSummary[]>([])

  useEffect(() => { (async () => { try { setJobs(await listJobs()); if (!jobId && jobs.length) setJobId(String(jobs[0].id)) } catch {} })() }, [])

  async function run() {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) { alert('Enter YYYY-MM'); return }
    setLoading(true)
    try {
      const data = await billingReportApi(month, jobId || undefined)
      setRows(data.jobs)
    } catch (e: any) {
      alert(e?.message || 'Failed to load')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing Report</h1>
      </header>

      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div>
            <label className="text-sm text-slate-500">Month (YYYY-MM)</label>
            <input value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900" placeholder="2025-10" />
          </div>
          <div>
            <label className="text-sm text-slate-500">Job (optional)</label>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="rounded-lg border px-3 py-1.5 bg-white dark:bg-neutral-900">
              <option value="">All jobs</option>
              {jobs.map((j) => (
                <option key={String(j.id)} value={String(j.id)}>{j.name}</option>
              ))}
            </select>
          </div>
          <div><button onClick={run} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50" disabled={loading}>{loading ? 'Loading…' : 'Run'}</button></div>
        </div>
      </section>

      {rows.length > 0 && (
        <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
          <h2 className="text-lg font-semibold mb-3">Results</h2>
          <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
              <tr>
                <th className="px-3 py-2 text-left">Job</th>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Hours</th>
                <th className="px-3 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {rows.map((r) => (
                <tr key={r.job_id}>
                  <td className="px-3 py-2">{r.job_name}</td>
                  <td className="px-3 py-2">{r.client_name || '—'}</td>
                  <td className="px-3 py-2">{r.hours.toFixed(2)}</td>
                  <td className="px-3 py-2">R{r.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Optional: breakdown by employee */}
          <div className="mt-4 text-xs text-slate-500">Totals by employee available in API response</div>
        </section>
      )}
    </div>
  )
}

