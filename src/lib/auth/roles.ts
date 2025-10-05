export type Role = 'admin' | 'manager' | 'hr' | 'employee' | 'staff'

export const isAdminLike = (role: Role) => role === 'admin' || role === 'manager' || role === 'hr'
export const isEmployeeLike = (role: Role) => role === 'employee' || role === 'staff'

const perms: Record<string, Role[]> = {
  viewCompanyKpis: ['admin', 'manager', 'hr'],
  approveLeave: ['admin', 'manager', 'hr'],
  inviteEmployees: ['admin', 'manager', 'hr'],
  requestLeave: ['employee', 'staff', 'admin', 'manager', 'hr'],
  uploadDocs: ['employee', 'staff', 'admin', 'manager', 'hr'],
  viewMyItems: ['employee', 'staff'],
}

export function can(role: Role, action: string): boolean {
  const allowed = perms[action]
  if (!allowed) return false
  return allowed.includes(role)
}

