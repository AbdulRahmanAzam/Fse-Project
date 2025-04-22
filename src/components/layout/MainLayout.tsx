import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '../theme/theme-provider'
import { Toaster } from '../ui/toaster'
import Header from './header'

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="genz-scholars-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

export default MainLayout 