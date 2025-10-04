import React from 'react'
import { Form, Input, Select, SelectItem, Checkbox, Button, Card, CardHeader, CardBody, Divider } from '@heroui/react'
import type { ValidationErrors } from '@react-types/shared'
import { createEmployee, type EmployeeIn, type EmployeeOut } from '../../lib/api'

export default function AddEmployee({ onSuccess, onCancel }: { onSuccess: (emp: EmployeeOut) => void; onCancel: () => void }) {
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [role, setRole] = React.useState('employee')
  const [isActive, setIsActive] = React.useState(true)
  const [startDate, setStartDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10))

  function getEmailError(value: string) {
    if (!value) return 'Email is required'
    if (!/.+@.+\..+/.test(value)) return 'Enter a valid email address'
    return null
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, FormDataEntryValue>

    const newErrors: ValidationErrors = {}
    const first_name = String(data.first_name || '').trim()
    const last_name = String(data.last_name || '').trim()
    const email = String(data.email || '').trim()
    const title = String(data.title || '').trim() || undefined
    const manager_id_raw = String(data.manager_id || '').trim()

    const emailErr = getEmailError(email)
    if (!first_name) newErrors.first_name = 'First name is required'
    if (!last_name) newErrors.last_name = 'Last name is required'
    if (emailErr) newErrors.email = emailErr
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const payload: EmployeeIn = {
      first_name,
      last_name,
      email,
      role: role || 'employee',
      title,
      start_date: startDate,
      manager_id: manager_id_raw ? Number(manager_id_raw) : undefined,
      is_active: isActive,
    }

    try {
      setSubmitting(true)
      const created = await createEmployee(payload)
      onSuccess(created)
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to create employee' } as ValidationErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0">
      <Card shadow="sm" radius="lg" className="border">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Add Employee</h2>
          <p className="text-sm text-foreground-500">Create a new team member profile. Required fields are marked.</p>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 md:p-8">
          <Form className="w-full" validationErrors={errors} onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* First name */}
              <div className="space-y-1">
                <label htmlFor="first_name" className="text-sm font-medium text-foreground-600">First name</label>
                <Input
                  id="first_name"
                  isRequired
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="first_name"
                  placeholder="e.g., Alex"
                  className="w-full"
                />
              </div>

              {/* Last name */}
              <div className="space-y-1">
                <label htmlFor="last_name" className="text-sm font-medium text-foreground-600">Last name</label>
                <Input
                  id="last_name"
                  isRequired
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="last_name"
                  placeholder="e.g., Johnson"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-foreground-600">Email</label>
                <Input
                  id="email"
                  isRequired
                  type="email"
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="email"
                  placeholder="you@company.com"
                  className="w-full"
                  description="We'll never share this."
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="title" className="text-sm font-medium text-foreground-600">Title</label>
                <Input
                  id="title"
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="title"
                  placeholder="e.g., Product Manager"
                  className="w-full"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium text-foreground-600">Role</label>
                <Select
                  id="role"
                  isRequired
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="role"
                  selectedKeys={new Set([role])}
                  onSelectionChange={(keys) => setRole(Array.from(keys)[0] as string)}
                  placeholder="Select role"
                  className="w-full"
                >
                  <SelectItem key="employee">Employee</SelectItem>
                  <SelectItem key="manager">Manager</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                  <SelectItem key="hr">HR</SelectItem>
                  <SelectItem key="staff">Staff</SelectItem>
                </Select>
              </div>

              {/* Start date */}
              <div className="space-y-1">
                <label htmlFor="start_date" className="text-sm font-medium text-foreground-600">Start date</label>
                <Input
                  id="start_date"
                  type="date"
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="start_date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Manager ID */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="manager_id" className="text-sm font-medium text-foreground-600">Manager ID (optional)</label>
                <Input
                  id="manager_id"
                  type="number"
                  variant="bordered"
                  radius="md"
                  size="md"
                  name="manager_id"
                  placeholder="e.g., 42"
                  min={0}
                  className="w-full"
                  description="If the employee reports to a specific manager."
                />
              </div>

              {/* Active */}
              <div className="md:col-span-2">
                <Checkbox
                  classNames={{ label: 'text-small' }}
                  isSelected={isActive}
                  onValueChange={setIsActive}
                  name="is_active"
                  value="true"
                >
                  Active
                </Checkbox>
              </div>

              {errors.form && (
                <div className="md:col-span-2 text-danger text-sm">{errors.form}</div>
              )}

              {/* Actions */}
              <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                <Button variant="bordered" onPress={onCancel} disabled={submitting}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={submitting}>
                  Save
                </Button>
              </div>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}
