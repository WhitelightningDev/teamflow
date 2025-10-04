import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p className="mb-6">Welcome to Teamflow.</p>
      <nav className="flex gap-4 text-blue-600">
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </main>
  )
}

