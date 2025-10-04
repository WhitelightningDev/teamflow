import { useState, useEffect } from 'react'
import { useEmployee } from '../../../hooks/useEmployee'
import type { EmployeeIn } from '../../../lib/api'

export default function EmployeeDetails({ employeeId, onUpdated, onCancel }: { employeeId: number | string; onUpdated: () => void; onCancel: () => void }) {
  const { employee, loading, error, update, refresh } = useEmployee(employeeId)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [startDate, setStartDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!employee) return
    setEmail(employee.email || '')
    setRole(employee.role || 'employee')
    const d = employee.start_date ? String(employee.start_date).slice(0, 10) : ''
    setStartDate(d)
    setIsActive(employee.is_active !== false)
  }, [employee])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      setSaving(true)
      const changes: Partial<EmployeeIn> = {
        email,
        role,
        start_date: startDate || undefined,
        is_active: isActive,
      }
      await update(changes)
      await refresh(employeeId)
      onUpdated()
    } catch (err: any) {
      setFormError(err?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !employee) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-neutral-800" />
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-neutral-800" />
        </div>
        <div className="h-10 w-full rounded bg-slate-200 dark:bg-neutral-800" />
        <div className="h-10 w-full rounded bg-slate-200 dark:bg-neutral-800" />
      </div>
    )
  }

  if (error && !employee) {
    return <div className="text-rose-600 text-sm">{error}</div>
  }

  return (
    <form className="w-full" onSubmit={onSubmit}>
      {formError && <div className="text-rose-600 text-sm mb-3">{formError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email<span className="text-rose-600">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Active */}
        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 select-none text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600"
            />
            <span>Active</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">
          Close
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
