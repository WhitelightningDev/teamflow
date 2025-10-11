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

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'https://teamflow-backend-ivkm.onrender.com'

// Brand assets (used by UI and can be shared with backend templates)
export const BRAND = {
  name: (import.meta as any).env?.VITE_BRAND_NAME || 'Teamflow',
  // Use env overrides; otherwise Logo component will fallback to imported asset
  logoUrl: (import.meta as any).env?.VITE_BRAND_LOGO_URL || '',
  logoMarkUrl: (import.meta as any).env?.VITE_BRAND_LOGO_MARK_URL || '',
  emailLogoUrl: (import.meta as any).env?.VITE_BRAND_EMAIL_LOGO_URL || (import.meta as any).env?.VITE_BRAND_LOGO_URL || '',
}

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
  comment?: string
}

export type DocumentOut = {
  id: number | string
  filename: string
  content_type?: string | null
  size?: number
  uploaded_by?: number
  uploaded_at?: string | Date
  employee_id?: string | number | null
  leave_id?: string | number | null
  category?: string | null
}

// Time tracking types
export type JobOut = {
  id: string | number
  name: string
  client_name?: string | null
  default_rate: number
  active: boolean
}

export type JobIn = {
  name: string
  client_name?: string | null
  default_rate?: number
  active?: boolean
}

export type JobUpdate = Partial<JobIn>

export type JobRateOut = {
  id: string | number
  job_id: string | number
  employee_id: string | number
  rate: number
}

export type JobRateIn = {
  employee_id: string | number
  rate: number
}

export type TimeEntryOut = {
  id: string | number
  job_id: string | number
  employee_id: string | number
  start_ts?: string
  end_ts?: string | null
  break_minutes: number
  is_active: boolean
  on_break: boolean
  duration_minutes?: number | null
  note?: string | null
  rate?: number | null
  amount?: number | null
}

export type ManualTimeEntryIn = {
  job_id: string | number
  start_ts: string
  end_ts: string
  break_minutes?: number
  note?: string
}

export type ManualTimeEntryUpdate = Partial<Omit<ManualTimeEntryIn, 'job_id'>>

export type ClockInPayload = { job_id: string | number; note?: string }

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

export async function listDocuments(params?: { page?: number; size?: number; employee_id?: number; leave_id?: number | string }): Promise<Paginated<DocumentOut>> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.size) q.set('size', String(params.size))
  if (params?.employee_id) q.set('employee_id', String(params.employee_id))
  if (params?.leave_id) q.set('leave_id', String(params.leave_id))
  const qs = q.toString()
  return apiFetch<Paginated<DocumentOut>>(`/api/v1/documents${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function uploadDocument(file: File, opts?: { employee_id?: number | string; leave_id?: number | string; category?: string }): Promise<DocumentOut> {
  const form = new FormData()
  form.append('file', file)
  if (opts?.employee_id != null) form.append('employee_id', String(opts.employee_id))
  if (opts?.leave_id != null) form.append('leave_id', String(opts.leave_id))
  if (opts?.category) form.append('category', opts.category)
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

// Jobs APIs
export async function listJobs(params?: { active?: boolean; assigned_to_me?: boolean }): Promise<JobOut[]> {
  const q = new URLSearchParams()
  if (params?.active != null) q.set('active', String(params.active))
  if (params?.assigned_to_me != null) q.set('assigned_to_me', String(params.assigned_to_me))
  const qs = q.toString()
  return apiFetch<JobOut[]>(`/api/v1/time/jobs${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function createJobApi(payload: JobIn): Promise<JobOut> {
  return apiFetch<JobOut>(`/api/v1/time/jobs`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateJobApi(id: string | number, payload: JobUpdate): Promise<JobOut> {
  return apiFetch<JobOut>(`/api/v1/time/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function setJobRateApi(jobId: string | number, payload: JobRateIn): Promise<JobRateOut> {
  return apiFetch<JobRateOut>(`/api/v1/time/jobs/${jobId}/rates`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function listJobRatesApi(jobId: string | number): Promise<JobRateOut[]> {
  return apiFetch<JobRateOut[]>(`/api/v1/time/jobs/${jobId}/rates`, { method: 'GET' })
}

// Job assignments APIs
export type JobAssignment = { id: string | number; job_id: string | number; employee_id: string | number }
export async function listJobAssignmentsApi(jobId: string | number): Promise<JobAssignment[]> {
  return apiFetch<JobAssignment[]>(`/api/v1/time/jobs/${jobId}/assignments`, { method: 'GET' })
}
export async function assignJobApi(jobId: string | number, employee_id: string | number): Promise<JobAssignment> {
  return apiFetch<JobAssignment>(`/api/v1/time/jobs/${jobId}/assign`, { method: 'POST', body: JSON.stringify({ employee_id }) })
}
export async function assignJobByEmailApi(jobId: string | number, employee_email: string): Promise<JobAssignment> {
  return apiFetch<JobAssignment>(`/api/v1/time/jobs/${jobId}/assign`, { method: 'POST', body: JSON.stringify({ employee_email }) })
}
export async function unassignJobApi(jobId: string | number, employee_id: string | number): Promise<{ status: string; job_id: string | number; employee_id: string | number }> {
  return apiFetch<{ status: string; job_id: string | number; employee_id: string | number }>(`/api/v1/time/jobs/${jobId}/assign/${employee_id}`, { method: 'DELETE' })
}

// Time entry APIs
export async function clockInApi(payload: ClockInPayload): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries/clock-in`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function breakStartApi(): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries/break/start`, { method: 'POST' })
}

export async function breakEndApi(): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries/break/end`, { method: 'POST' })
}

export async function clockOutApi(): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries/clock-out`, { method: 'POST' })
}

export async function createManualEntryApi(payload: ManualTimeEntryIn): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateManualEntryApi(id: string | number, payload: ManualTimeEntryUpdate): Promise<TimeEntryOut> {
  return apiFetch<TimeEntryOut>(`/api/v1/time/entries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function deleteTimeEntryApi(id: string | number): Promise<{ status: string; id: string | number }> {
  return apiFetch<{ status: string; id: string | number }>(`/api/v1/time/entries/${id}`, { method: 'DELETE' })
}

export async function listMyTimeEntriesApi(params?: { job_id?: string | number; from?: string; to?: string; page?: number; limit?: number }): Promise<Paginated<TimeEntryOut>> {
  const q = new URLSearchParams()
  if (params?.job_id) q.set('job_id', String(params.job_id))
  if (params?.from) q.set('from', params.from)
  if (params?.to) q.set('to', params.to)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return apiFetch<Paginated<TimeEntryOut>>(`/api/v1/time/entries/me${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function billingReportApi(month: string, job_id?: string | number): Promise<{ month: string; jobs: { job_id: string; job_name: string; client_name?: string | null; minutes: number; hours: number; amount: number; by_employee: { employee_id: string; minutes: number; rate: number; amount: number }[] }[] }> {
  const q = new URLSearchParams({ month })
  if (job_id) q.set('job_id', String(job_id))
  return apiFetch(`/api/v1/time/reports/billing?${q.toString()}`, { method: 'GET' })
}

// Assignment activity APIs
export type AssignmentActivity = {
  id: string | number
  job_id?: string | number | null
  job_name?: string | null
  action: 'assigned' | 'started' | 'done' | 'canceled' | 'unassigned'
  created_at: string
}

export async function listMyAssignmentActivityApi(params?: { page?: number; limit?: number; employee_id?: string | number }): Promise<Paginated<AssignmentActivity>> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.employee_id != null) q.set('employee_id', String(params.employee_id))
  const qs = q.toString()
  return apiFetch<Paginated<AssignmentActivity>>(`/api/v1/time/assignments/activity${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

// My assignments with state
export type MyAssignment = { job_id: string | number; job_name: string; client_name?: string | null; state: 'assigned' | 'in_progress' | 'done' | 'canceled'; state_changed_at?: string }
export async function listMyAssignmentsApi(): Promise<{ items: MyAssignment[] }> {
  return apiFetch<{ items: MyAssignment[] }>(`/api/v1/time/my/assignments`, { method: 'GET' })
}

// Admin: company assignments with employee info
export type CompanyAssignment = MyAssignment & { employee_id: string | number; employee_name?: string | null; last_activity?: string | null; last_activity_at?: string | null }
export async function listCompanyAssignmentsApi(params?: { state?: 'assigned' | 'in_progress' | 'done' | 'canceled'; page?: number; limit?: number }): Promise<Paginated<CompanyAssignment>> {
  const q = new URLSearchParams()
  if (params?.state) q.set('state', params.state)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return apiFetch<Paginated<CompanyAssignment>>(`/api/v1/time/assignments${qs ? `?${qs}` : ''}`, { method: 'GET' })
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

// Dashboard analytics APIs
export type SummaryMetrics = { employees: number; pending_leaves: number; documents_this_week: number; on_leave_today: number }
export type AlertItem = { key: string; label: string; value: number; threshold: number; severity: 'info'|'warning'|'critical'; status: 'ok'|'alert'; hint?: string }
export type TrendPoint = { period: string; value: number }
export type TrendSeries = { key: string; label: string; points: TrendPoint[] }
export type ScorecardRow = { group: string; employees: number; pending_leaves: number; active_assignments: number }
export type DrilldownRow = { group: string; value: number }
export type DrilldownResponse = { metric: string; group_by: string; rows: DrilldownRow[] }

export async function dashboardSummary(): Promise<SummaryMetrics> {
  return apiFetch<SummaryMetrics>('/api/v1/dashboard/summary', { method: 'GET' })
}
export async function dashboardAlerts(params?: { pending_leave_threshold?: number }): Promise<AlertItem[]> {
  const q = new URLSearchParams()
  if (params?.pending_leave_threshold != null) q.set('pending_leave_threshold', String(params.pending_leave_threshold))
  const qs = q.toString()
  return apiFetch<AlertItem[]>(`/api/v1/dashboard/alerts${qs ? `?${qs}` : ''}`, { method: 'GET' })
}
export async function dashboardTrends(months = 6): Promise<TrendSeries[]> {
  const q = new URLSearchParams({ months: String(months) })
  return apiFetch<TrendSeries[]>(`/api/v1/dashboard/trends?${q.toString()}`, { method: 'GET' })
}
export async function dashboardScorecards(): Promise<ScorecardRow[]> {
  return apiFetch<ScorecardRow[]>(`/api/v1/dashboard/scorecards`, { method: 'GET' })
}
export async function dashboardDrilldown(metric: string, group_by = 'department'): Promise<DrilldownResponse> {
  const q = new URLSearchParams({ metric, group_by })
  return apiFetch<DrilldownResponse>(`/api/v1/dashboard/drilldown?${q.toString()}`, { method: 'GET' })
}
export async function dashboardExportCsv(): Promise<Blob> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/dashboard/export.csv`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (res.status === 401) await handleUnauthorized(res, token)
  if (!res.ok) throw new Error('Export failed')
  return await res.blob()
}
