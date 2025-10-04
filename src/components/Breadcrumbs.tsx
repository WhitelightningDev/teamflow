import { Link } from 'react-router-dom'

type Item = { label: string; to?: string }

export default function Breadcrumbs({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 dark:text-slate-300">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={idx} className="inline-flex items-center gap-1">
              {idx > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />}
              {isLast || !item.to ? (
                <span aria-current="page" className="font-medium text-slate-800 dark:text-slate-100">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-blue-600">{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 18l6-6-6-6v12z" />
    </svg>
  )
}

