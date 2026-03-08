import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { bootstrapSession } from './lib/api'
import './index.css'
import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,               // fail fast — good for hackathon demo
      staleTime: 30_000,      // 30 s before refetch
      refetchOnWindowFocus: false,
    },
  },
})

// Obtain an anonymous session token so backend calls include Authorization header
bootstrapSession().catch(() => {
  // Non-fatal: backend may not require a session token for public routes
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

