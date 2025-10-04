import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'

export default function EmployeesPage() {
  const [query, setQuery] = useState('')
  const [employees, setEmployees] = useState(() => initialEmployees)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      [e.name, e.role, e.status].some((v) => v.toLowerCase().includes(q))
    )
  }, [employees, query])

  function addEmployee() {
    const n = prompt('Name? (e.g. Alex Johnson)')
    const r = n ? prompt('Role? (e.g. Designer)') : undefined
    if (n && r) {
      setEmployees((list) => [
        { id: String(Date.now()), name: n, role: r, status: 'Active' },
        ...list,
      ])
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Employees' }]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Employees</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your team members and roles.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addEmployee} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Add Employee</button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-96">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 pl-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Edit</button>
                      <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
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
          {filtered.map((e) => (
            <div key={e.id} className="rounded-xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-slate-500">{e.role}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  e.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                }`}>{e.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Edit</button>
                <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
                <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const initialEmployees = [
  { id: '1', name: 'Alex Johnson', role: 'Product Manager', status: 'Active' },
  { id: '2', name: 'Priya Patel', role: 'Frontend Engineer', status: 'Active' },
  { id: '3', name: 'Sam Lee', role: 'Designer', status: 'Inactive' },
  { id: '4', name: 'Maria Garcia', role: 'HR Specialist', status: 'Active' },
]

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  )
}
