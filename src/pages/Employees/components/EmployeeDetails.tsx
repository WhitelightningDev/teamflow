import { useEffect, useState } from 'react'
import { useEmployee } from '../../../hooks/useEmployee'

export default function EmployeeDetails({ employeeId, onClose }: { employeeId: number | string; onClose: () => void }) {
  const { employee, loading, error } = useEmployee(employeeId)
  const [startDate, setStartDate] = useState('')

  useEffect(() => {
    if (!employee) return
    const d = employee.start_date ? String(employee.start_date).slice(0, 10) : ''
    setStartDate(d)
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

  const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-200'
  const fieldCls = 'mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 text-slate-700 dark:text-slate-200'

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Name</label>
          <div className={fieldCls}>
            {[employee?.first_name, employee?.last_name].filter(Boolean).join(' ') || '—'}
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <div className={fieldCls}>{employee?.email || '—'}</div>
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <div className={fieldCls}>{employee?.role || 'employee'}</div>
        </div>
        <div>
          <label className={labelCls}>Start date</label>
          <div className={fieldCls}>{startDate || '—'}</div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Status</label>
          <div className={fieldCls}>{employee?.is_active === false ? 'Inactive' : 'Active'}</div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">Close</button>
      </div>
    </div>
  )
}
