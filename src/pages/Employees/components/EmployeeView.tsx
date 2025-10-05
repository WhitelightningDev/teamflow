import { Skeleton, Button } from '@heroui/react'
import { useEmployee } from '../../../hooks/useEmployee'

export default function EmployeeView({ employeeId, onClose }: { employeeId: number | string; onClose: () => void }) {
  const { employee, loading, error } = useEmployee(employeeId)

  if (loading && !employee) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="rounded-lg"><div className="h-10 w-10 rounded-lg bg-default-300" /></Skeleton>
          <Skeleton className="w-40 rounded"><div className="h-4 w-40 rounded bg-default-200" /></Skeleton>
        </div>
        <Skeleton className="w-full rounded"><div className="h-8 w-full rounded bg-default-200" /></Skeleton>
        <Skeleton className="w-full rounded"><div className="h-8 w-full rounded bg-default-200" /></Skeleton>
      </div>
    )
  }

  if (error && !employee) {
    return <div className="text-rose-600 text-sm">{error}</div>
  }

  const rows: Array<{ label: string; value: string | number | undefined | null }> = [
    { label: 'Employee ID', value: employee?.id },
    { label: 'First name', value: employee?.first_name },
    { label: 'Last name', value: employee?.last_name },
    { label: 'Email', value: employee?.email },
    { label: 'Role', value: employee?.role || '—' },
    { label: 'Title', value: employee?.title || '—' },
    { label: 'Start date', value: employee?.start_date ? String(employee.start_date).slice(0, 10) : '—' },
    { label: 'Manager ID', value: employee?.manager_id ?? '—' },
    { label: 'Active', value: employee?.is_active === false ? 'No' : 'Yes' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-500">{r.label}</span>
            <span className="text-sm mt-0.5">{String(r.value ?? '—')}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="bordered" onPress={onClose}>Close</Button>
      </div>
    </div>
  )
}

