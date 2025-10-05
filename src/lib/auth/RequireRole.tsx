import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { getUser } from '../api'

export default function RequireRole({ allow, children }: { allow: string[]; children: JSX.Element }) {
  const role = ((getUser() as any)?.role) || 'employee'
  return allow.includes(role) ? children : <Navigate to="/not-authorized" replace />
}
