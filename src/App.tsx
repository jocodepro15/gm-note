import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import NewWorkout from './pages/NewWorkout'
import History from './pages/History'
import Informations from './pages/Informations'
import Calculatrice from './pages/Calculatrice'
import Chronometre from './pages/Chronometre'
import Programmes from './pages/Programmes'
import Progression from './pages/Progression'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Route protégée : redirige vers /login si pas connecté
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Route publique : redirige vers / si déjà connecté
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Routes publiques (auth) */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Routes protégées */}
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><Layout><NewWorkout /></Layout></ProtectedRoute>} />
      <Route path="/edit/:workoutId" element={<ProtectedRoute><Layout><NewWorkout /></Layout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
      <Route path="/timer" element={<ProtectedRoute><Layout><Chronometre /></Layout></ProtectedRoute>} />
      <Route path="/calc" element={<ProtectedRoute><Layout><Calculatrice /></Layout></ProtectedRoute>} />
      <Route path="/infos" element={<ProtectedRoute><Layout><Informations /></Layout></ProtectedRoute>} />
      <Route path="/programmes" element={<ProtectedRoute><Layout><Programmes /></Layout></ProtectedRoute>} />
      <Route path="/progression" element={<ProtectedRoute><Layout><Progression /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
