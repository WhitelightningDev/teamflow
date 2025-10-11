import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Alert } from '@heroui/react'

export type AlertItem = {
  id: string
  color: 'success' | 'primary' | 'warning' | 'danger'
  title: string
  description?: string
  duration?: number
}

type AlertsContextValue = {
  push: (item: Omit<AlertItem, 'id'>) => void
  success: (title: string, description?: string, durationMs?: number) => void
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<AlertItem[]>([])

  const push = useCallback((item: Omit<AlertItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const full: AlertItem = { id, duration: 4000, ...item }
    setItems((prev) => [...prev, full])
    const ms = full.duration ?? 4000
    if (ms > 0) {
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), ms)
    }
  }, [])

  const value = useMemo<AlertsContextValue>(() => ({
    push,
    success: (title: string, description?: string, durationMs?: number) => push({ color: 'success', title, description, duration: durationMs ?? 4000 }),
  }), [push])

  return (
    <AlertsContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.id} className="pointer-events-auto w-80">
            <Alert
              color={it.color}
              title={it.title}
              description={it.description}
              isVisible
              variant="faded"
              onClose={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
            />
          </div>
        ))}
      </div>
    </AlertsContext.Provider>
  )
}

export function useAlerts() {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider')
  return ctx
}

