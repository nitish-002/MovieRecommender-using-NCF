import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { PredictorPage } from './pages/PredictorPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { OnboardingPage } from './pages/OnboardingPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute><LoginPage /></PublicRoute>} path="/login" />
      <Route element={<PublicRoute><RegisterPage /></PublicRoute>} path="/register" />

      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/predictor" element={<PredictorPage />} />
        <Route path="/insights" element={<Navigate to="/admin" replace />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
