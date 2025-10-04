import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    // Replace with real registration flow
    alert(`Registering ${name}`)
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black"
            placeholder="Ada Lovelace"
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black"
            placeholder="••••••••"
            required
          />
        </label>
        <button type="submit" className="w-full rounded bg-blue-600 text-white py-2">
          Create Account
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </main>
  )
}
