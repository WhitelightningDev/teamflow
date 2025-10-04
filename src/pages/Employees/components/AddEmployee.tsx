import React from 'react'
import { Form, Input, Select, SelectItem, Checkbox, Button } from '@heroui/react'
import { createEmployee, type EmployeeIn, type EmployeeOut } from '../../../lib/api'

export default function AddEmployee({ onSuccess, onCancel }: { onSuccess: (emp: EmployeeOut) => void; onCancel: () => void }) {
  const [errors, setErrors] = React.useState<Record<string, string | string[]>>({})
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

    const newErrors: Record<string, string> = {}
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
      setErrors({ form: err?.message || 'Failed to create employee' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form className="w-full" validationErrors={errors} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          isRequired
          label="First name"
          labelPlacement="outside"
          name="first_name"
          placeholder="e.g., Alex"
        />
        <Input
          isRequired
          label="Last name"
          labelPlacement="outside"
          name="last_name"
          placeholder="e.g., Johnson"
        />

        <Input
          isRequired
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="you@company.com"
          type="email"
        />

        <Input
          label="Title"
          labelPlacement="outside"
          name="title"
          placeholder="e.g., Product Manager"
        />

        <Select
          isRequired
          label="Role"
          labelPlacement="outside"
          name="role"
          selectedKeys={new Set([role])}
          onSelectionChange={(keys) => setRole(Array.from(keys)[0] as string)}
          placeholder="Select role"
        >
          <SelectItem key="employee">Employee</SelectItem>
          <SelectItem key="manager">Manager</SelectItem>
          <SelectItem key="admin">Admin</SelectItem>
        </Select>

        <Input
          type="date"
          label="Start date"
          labelPlacement="outside"
          name="start_date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <Input
          type="number"
          label="Manager ID (optional)"
          labelPlacement="outside"
          name="manager_id"
          placeholder="e.g., 42"
          min={0}
        />

        <div className="sm:col-span-2">
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
          <div className="sm:col-span-2 text-rose-600 text-sm">{errors.form as string}</div>
        )}
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="bordered" onPress={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button color="primary" type="submit" isLoading={submitting}>
          Save
        </Button>
      </div>
    </Form>
  )
}

