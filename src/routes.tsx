import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home-page'
import MainLayout from './components/layout/main-layout'
import AuthPage from './pages/auth-page'
import ProtectedRoute from './components/routes/protected-route'
import PublicRoute from './components/routes/public-route'
import CommunitiesPage from './pages/all-communities-page'
import CommunityPage from './pages/community-page'
import CreateCommunityPage from './pages/create-community-page'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute permission="member"><MainLayout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/community/:id" element={<CommunityPage />} />
        <Route path="/community/create" element={<ProtectedRoute permission="admin"><CreateCommunityPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default AppRoutes;
