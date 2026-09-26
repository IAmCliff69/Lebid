import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Insights from './pages/Insights'
import AIAssistant from './pages/AIAssistant'
import Onboarding from './pages/Onboarding'
import { useNotifications } from './hooks/useNotifications'
import { isOnboarded, updateStreak } from './utils/storage'

function AppInner() {
  const [onboarded, setOnboarded] = useState(isOnboarded())
  const [theme, setTheme] = useState(() => localStorage.getItem('lebid_theme') || 'dark')
  useNotifications()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('lebid_theme', theme)
  }, [theme])

  useEffect(() => {
    if (onboarded) updateStreak()
  }, [onboarded])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner"   element={<Planner />} />
          <Route path="/insights"  element={<Insights />} />
          <Route path="/ai"        element={<AIAssistant />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}