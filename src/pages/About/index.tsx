import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="mb-6">This is the About page.</p>
      <Link className="text-blue-600" to="/">Back to Home</Link>
    </main>
  )
}

