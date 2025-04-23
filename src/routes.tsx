import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home-page'
import MainLayout from './components/layout/main-layout'
import AuthPage from './pages/auth-page'
// import ProtectedRoute from './components/routes/protected-route'
import PublicRoute from './components/routes/public-route'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes;
