import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../api'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getToken()
  return token ? children : <Navigate to="/login" replace />
}

