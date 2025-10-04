import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="p-6 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="mb-6">Page not found.</p>
      <Link className="text-blue-600" to="/">Go Home</Link>
    </main>
  )
}

