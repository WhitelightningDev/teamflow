import { useEffect, useState } from 'react'

export default function CompanyAttendance() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState('')

  async function reload() {
    setLoading(true)
    const base = (import.meta as any).env?.VITE_API_BASE || 'https://teamflow-backend-ivkm.onrender.com'
    const q = new URLSearchParams()
    if (employeeId) q.set('employee_id', employeeId)
    const res = await fetch(`${base}/api/v1/attendance?${q.toString()}`)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  function exportCsv() {
    const headers = ['employee_id','date','clock_in','clock_out']
    const rows = items.map(r => [r.employee_id, String(r.date).slice(0,10), r.clock_in_ts ? String(r.clock_in_ts) : '', r.clock_out_ts ? String(r.clock_out_ts) : ''])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Company Attendance</h1>
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium">Employee ID</label>
          <input value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} className="mt-1 w-64 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
        </div>
        <button onClick={reload} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Filter</button>
        <button onClick={exportCsv} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">Export CSV</button>
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
          <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Clock In</th>
              <th className="px-3 py-2 text-left">Clock Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {items.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2">{r.employee_id}</td>
                <td className="px-3 py-2">{String(r.date).slice(0,10)}</td>
                <td className="px-3 py-2">{r.clock_in_ts ? String(r.clock_in_ts).slice(11,19) : '—'}</td>
                <td className="px-3 py-2">{r.clock_out_ts ? String(r.clock_out_ts).slice(11,19) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
