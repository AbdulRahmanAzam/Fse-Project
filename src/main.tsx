import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import './index.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/toaster'

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="genz-scholars-theme">
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
      <Toaster />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <AppRoutes />
    </Providers>
  </React.StrictMode>,
)
