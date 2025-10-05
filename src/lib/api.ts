// src/lib/api.ts
export type AuthUser = {
  id: number | string
  first_name: string
  last_name: string
  email: string
}

export type AuthResponse = {
  user: AuthUser
  token: string
}

export type RegisterBody = {
  first_name: string
  last_name: string
  email: string
  password: string
  company_name: string
}

export type LoginBody = {
  email: string
  password: string
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'

async function handleUnauthorized(res: Response, token: string | null) {
  if (res.status !== 401 || !token) return
  try {
    const body = await res.clone().json().catch(() => ({} as any))
    const detail = (body && (body.detail || body.message)) as string | undefined
    if (detail && detail.toLowerCase().includes('token expired')) {
      try { clearAuth() } catch {}
      if (typeof window !== 'undefined') {
        const loc = window.location
        if (!loc.pathname.startsWith('/login')) {
          window.location.assign('/login?session=expired')
        }
      }
    }
  } catch {
    // ignore
  }
}

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    ...init,
  })
  if (res.status === 401) await handleUnauthorized(res, token)
  if (!res.ok) {
    let detail = 'Request failed'
    try {
      const body = await res.json()
      detail = (body && (body.detail || body.message)) || detail
    } catch {}
    throw new Error(`${res.status} ${res.statusText}: ${detail}`)
  }
  return (await res.json()) as T
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function me(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/v1/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem('tf_token', auth.token)
  localStorage.setItem('tf_user', JSON.stringify(auth.user))
}

export function clearAuth() {
  localStorage.removeItem('tf_token')
  localStorage.removeItem('tf_user')
}

export function getToken(): string | null {
  return localStorage.getItem('tf_token')
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem('tf_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Generic paginated type
export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

// Minimal shapes used by dashboard
export type EmployeeOut = {
  id: number | string
  first_name: string
  last_name: string
  email: string
  role?: string
  title?: string | null
  start_date?: string | Date
  manager_id?: number | null
  is_active?: boolean
}

export type EmployeeIn = {
  first_name: string
  last_name: string
  email: string
  role?: string
  title?: string | null
  start_date: string
  manager_id?: number | null
  is_active?: boolean
}

export type LeaveOut = {
  id: number | string
  employee_id: number | string
  leave_type: string
  start_date: string | Date
  end_date: string | Date
  status: string
}

export type DocumentOut = {
  id: number | string
  filename: string
  content_type?: string | null
  size?: number
  uploaded_by?: number
  uploaded_at?: string | Date
}

export async function listEmployees(params?: { page?: number; size?: number; search?: string }): Promise<Paginated<EmployeeOut>> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.size) q.set('size', String(params.size))
  if (params?.search) q.set('search', params.search)
  const qs = q.toString()
  return apiFetch<Paginated<EmployeeOut>>(`/api/v1/employees${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function createEmployee(payload: EmployeeIn): Promise<EmployeeOut> {
  return apiFetch<EmployeeOut>('/api/v1/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getEmployee(id: number | string): Promise<EmployeeOut> {
  return apiFetch<EmployeeOut>(`/api/v1/employees/${id}`, { method: 'GET' })
}

export async function updateEmployee(id: number | string, payload: Partial<EmployeeIn>): Promise<EmployeeOut> {
  return apiFetch<EmployeeOut>(`/api/v1/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteEmployee(id: number | string): Promise<{ status: string; id: number | string }> {
  return apiFetch<{ status: string; id: number | string }>(`/api/v1/employees/${id}`, {
    method: 'DELETE',
  })
}

export async function inviteEmployee(id: number | string): Promise<{ status: string; email: string; expires_at: string }> {
  return apiFetch<{ status: string; email: string; expires_at: string }>(`/api/v1/employees/${id}/invite`, { method: 'POST' })
}

// Invite acceptance
export async function acceptInvite(body: { token: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function listLeaves(params?: { page?: number; size?: number; status?: string }): Promise<Paginated<LeaveOut>> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.size) q.set('size', String(params.size))
  if (params?.status) q.set('status', params.status)
  const qs = q.toString()
  return apiFetch<Paginated<LeaveOut>>(`/api/v1/leaves${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function updateLeaveStatus(id: number | string, status: 'approved' | 'rejected' | 'cancelled', comment?: string): Promise<LeaveOut> {
  return apiFetch<LeaveOut>(`/api/v1/leaves/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, comment }),
  })
}

export async function createLeave(body: { leave_type?: string; type_id?: string; start_date: string; end_date: string; reason?: string; half_day?: boolean }): Promise<LeaveOut> {
  return apiFetch<LeaveOut>('/api/v1/leaves', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function deleteLeave(id: number | string): Promise<{ status: string; id: number | string }> {
  return apiFetch<{ status: string; id: number | string }>(`/api/v1/leaves/${id}`, {
    method: 'DELETE',
  })
}

export async function listDocuments(params?: { page?: number; size?: number; employee_id?: number }): Promise<Paginated<DocumentOut>> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.size) q.set('size', String(params.size))
  if (params?.employee_id) q.set('employee_id', String(params.employee_id))
  const qs = q.toString()
  return apiFetch<Paginated<DocumentOut>>(`/api/v1/documents${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function uploadDocument(file: File, employee_id?: number | string): Promise<DocumentOut> {
  const form = new FormData()
  form.append('file', file)
  if (employee_id != null) form.append('employee_id', String(employee_id))
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/documents`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (res.status === 401) await handleUnauthorized(res, token)
  if (!res.ok) {
    let detail = 'Upload failed'
    try { const body = await res.json(); detail = body.detail || body.message || detail } catch {}
    throw new Error(`${res.status} ${res.statusText}: ${detail}`)
  }
  return (await res.json()) as DocumentOut
}

export async function deleteDocument(id: number | string): Promise<{ status: string; id: number | string }> {
  return apiFetch<{ status: string; id: number | string }>(`/api/v1/documents/${id}`, { method: 'DELETE' })
}

// Settings APIs
export type ProfileOut = {
  id: number | string
  first_name: string
  last_name: string
  email: string
  title?: string | null
  phone?: string | null
  timezone?: string | null
}

export type ProfileIn = {
  first_name: string
  last_name: string
  email: string
  title?: string | null
  phone?: string | null
  timezone?: string | null
}

export async function getProfile(): Promise<ProfileOut> {
  return apiFetch<ProfileOut>('/api/v1/settings/profile', { method: 'GET' })
}

export async function updateProfile(payload: Partial<ProfileIn>): Promise<ProfileOut> {
  return apiFetch<ProfileOut>('/api/v1/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export type CompanyOut = {
  id: number | string
  name: string
  domain: string
  timezone: string
}

export async function getCompany(): Promise<CompanyOut> {
  return apiFetch<CompanyOut>('/api/v1/settings/company', { method: 'GET' })
}

export async function updateCompany(payload: Partial<Pick<CompanyOut, 'name' | 'domain' | 'timezone'>>): Promise<CompanyOut> {
  return apiFetch<CompanyOut>('/api/v1/settings/company', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export type NotificationSettings = {
  email_notifications: boolean
  push_notifications: boolean
}

export async function getNotifications(): Promise<NotificationSettings> {
  return apiFetch<NotificationSettings>('/api/v1/settings/notifications', { method: 'GET' })
}

export async function updateNotifications(payload: Partial<NotificationSettings>): Promise<NotificationSettings> {
  return apiFetch<NotificationSettings>('/api/v1/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function changePasswordApi(body: { current_password: string; new_password: string }): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/api/v1/settings/password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
