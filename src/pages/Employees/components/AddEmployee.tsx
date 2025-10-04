import React from 'react'
import { createEmployee, type EmployeeIn, type EmployeeOut } from '../../../lib/api'

export default function AddEmployee({ onSuccess, onCancel }: { onSuccess: (emp: EmployeeOut) => void; onCancel: () => void }) {
  const [errors, setErrors] = React.useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [role, setRole] = React.useState('employee')
  const [isActive, setIsActive] = React.useState(true)
  const [startDate, setStartDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10))

  function getEmailError(value: string) {
    if (!value) return 'Email is required'
    if (!/.+@.+\..+/.test(value)) return 'Enter a valid email address'
    return null
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, FormDataEntryValue>

    const newErrors: Record<string, string> = {}
    const first_name = String(data.first_name || '').trim()
    const last_name = String(data.last_name || '').trim()
    const email = String(data.email || '').trim()
    const title = String(data.title || '').trim() || undefined
    const manager_id_raw = String(data.manager_id || '').trim()

    const emailErr = getEmailError(email)
    if (!first_name) newErrors.first_name = 'First name is required'
    if (!last_name) newErrors.last_name = 'Last name is required'
    if (emailErr) newErrors.email = emailErr
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const payload: EmployeeIn = {
      first_name,
      last_name,
      email,
      role: role || 'employee',
      title,
      start_date: startDate,
      manager_id: manager_id_raw ? Number(manager_id_raw) : undefined,
      is_active: isActive,
    }

    try {
      setSubmitting(true)
      const created = await createEmployee(payload)
      onSuccess(created)
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to create employee' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* First name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">First name<span className="text-rose-600">*</span></label>
          <input
            name="first_name"
            placeholder="e.g., Alex"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {errors.first_name && <p className="mt-1 text-xs text-rose-600">{errors.first_name as string}</p>}
        </div>

        {/* Last name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Last name<span className="text-rose-600">*</span></label>
          <input
            name="last_name"
            placeholder="e.g., Johnson"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {errors.last_name && <p className="mt-1 text-xs text-rose-600">{errors.last_name as string}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email<span className="text-rose-600">*</span></label>
          <input
            type="email"
            name="email"
            placeholder="you@company.com"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email as string}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
          <input
            name="title"
            placeholder="e.g., Product Manager"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Role<span className="text-rose-600">*</span></label>
          <select
            name="role"
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
            name="start_date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Manager id */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Manager ID (optional)</label>
          <input
            type="number"
            min={0}
            name="manager_id"
            placeholder="e.g., 42"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              name="is_active"
              value="true"
            />
            <span>Active</span>
          </label>
        </div>

        {errors.form && (
          <div className="sm:col-span-2 text-rose-600 text-sm">{errors.form as string}</div>
        )}
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
