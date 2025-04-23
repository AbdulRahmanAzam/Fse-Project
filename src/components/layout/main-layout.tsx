import { Outlet } from 'react-router-dom'
import Header from './header'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout 