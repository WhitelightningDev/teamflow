import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router'
import { AlertsProvider } from './components/AlertsProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AlertsProvider>
        <AppRouter />
      </AlertsProvider>
    </QueryClientProvider>
  </StrictMode>,
)
