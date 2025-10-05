import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getToken } from '../lib/api'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'

async function fetchNotifications() {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/notifications`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error('Failed notifications fetch')
  return res.json() as Promise<{ items: any[]; total: number }>
}

async function markRead(id: string | number) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error('Failed to mark read')
  return res.json()
}

export function useNotifications() {
  const qc = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications, refetchInterval: 15000 })
  const mutation = useMutation({
    mutationFn: (id: string | number) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  return { ...query, markRead: mutation.mutateAsync }
}
