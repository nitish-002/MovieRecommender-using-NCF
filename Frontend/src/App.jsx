import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { PredictorPage } from './pages/PredictorPage'
import { InsightsPage } from './pages/InsightsPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute><LoginPage /></PublicRoute>} path="/login" />
      <Route element={<PublicRoute><RegisterPage /></PublicRoute>} path="/register" />

      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/predictor" element={<PredictorPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
