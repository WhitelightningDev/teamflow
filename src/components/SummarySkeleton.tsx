import { Skeleton } from '@heroui/react'

export default function SummarySkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-busy>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-black/10 dark:bg-white/10" />
            </Skeleton>
            <div className="flex-1">
              <Skeleton className="w-24 rounded">
                <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
              </Skeleton>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="w-20 rounded">
              <div className="h-7 w-20 rounded bg-black/10 dark:bg-white/10" />
            </Skeleton>
            <Skeleton className="w-32 rounded">
              <div className="h-3 w-32 rounded bg-black/10 dark:bg-white/10" />
            </Skeleton>
          </div>
        </div>
      ))}
    </div>
  )
}
