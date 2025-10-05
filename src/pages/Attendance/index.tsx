import { getUser } from '../../lib/api'
import EmployeeAttendance from './EmployeeAttendance'
import CompanyAttendance from './CompanyAttendance'

export default function AttendancePage() {
  const role = ((getUser() as any)?.role) || 'employee'
  const adminLike = ['admin','manager','hr'].includes(role)
  return adminLike ? <CompanyAttendance /> : <EmployeeAttendance />
}

