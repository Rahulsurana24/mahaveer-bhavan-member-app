import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'

// Layout
import AdminLayout from './components/layout/AdminLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'

// Main Pages
import DashboardPage from './pages/Dashboard/DashboardPage'
import DataImportPage from './pages/DataImport/DataImportPage'
import DataExportPage from './pages/DataExport/DataExportPage'
import GalleryModerationPage from './pages/Gallery/GalleryModerationPage'
import MembersPage from './pages/Members/MembersPage'
import EventsPage from './pages/Events/EventsPage'
import ReportsPage from './pages/Reports/ReportsPage'
import SettingsPage from './pages/Settings/SettingsPage'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading Mahaveer Bhavan Admin...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <AdminLayout user={user}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryModerationPage />} />
        <Route path="/data-import" element={<DataImportPage />} />
        <Route path="/data-export" element={<DataExportPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
