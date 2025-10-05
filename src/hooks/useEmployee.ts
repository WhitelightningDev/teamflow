import { useCallback, useEffect, useState } from 'react'
import { getEmployee, updateEmployee, type EmployeeOut, type EmployeeIn } from '../lib/api'

export function useEmployee(employeeId?: number | string) {
  const [employee, setEmployee] = useState<EmployeeOut | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (id = employeeId) => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployee(id)
      setEmployee(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load employee')
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  const update = useCallback(async (updates: Partial<EmployeeIn>) => {
    if (!employeeId) return null
    setLoading(true)
    setError(null)
    try {
      const updated = await updateEmployee(employeeId, updates)
      setEmployee(updated)
      return updated
    } catch (e: any) {
      setError(e?.message || 'Failed to update employee')
      throw e
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => { refresh(employeeId) }, [employeeId, refresh])

  return { employee, loading, error, refresh, update }
}

