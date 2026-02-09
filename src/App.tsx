import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import NewWorkout from './pages/NewWorkout'
import History from './pages/History'
import Informations from './pages/Informations'
import Calculatrice from './pages/Calculatrice'
import Chronometre from './pages/Chronometre'
import Programmes from './pages/Programmes'
import Progression from './pages/Progression'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewWorkout />} />
        <Route path="/history" element={<History />} />
        <Route path="/timer" element={<Chronometre />} />
        <Route path="/calc" element={<Calculatrice />} />
        <Route path="/infos" element={<Informations />} />
        <Route path="/programmes" element={<Programmes />} />
        <Route path="/progression" element={<Progression />} />
      </Routes>
    </Layout>
  )
}

export default App
