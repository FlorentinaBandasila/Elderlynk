import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import { AuthProvider, ROLES, useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Unauthorized from '@/pages/Unauthorized'
import Dashboard from '@/pages/Dashboard'
import PatientPortal from '@/pages/PatientPortal'
import Patients from '@/pages/Patients'
import PatientDetail from '@/pages/PatientDetail'
import Consultations from '@/pages/Consultations'
import SensorConfig from '@/pages/SensorConfig'
import Devices from '@/pages/Devices'
import LiveAlarms from '@/pages/LiveAlarms'
import Notifications from '@/pages/Notifications'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Ajutor from '@/pages/Ajutor'

export const DarkModeContext = createContext()

/** The "/" landing: patients see their portal, everyone else the staff dashboard. */
function RoleHome() {
  const { hasRole } = useAuth()
  return hasRole(ROLES.PACIENT) ? <PatientPortal /> : <Dashboard />
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Everything below requires authentication */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/"              element={<RoleHome />} />
              <Route path="/patients"      element={<Patients />} />
              <Route path="/patients/:id"  element={<PatientDetail />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/sensor-config" element={<SensorConfig />} />
              <Route path="/live-alarms"   element={<LiveAlarms />} />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings"      element={<Settings />} />
              <Route path="/ajutor"        element={<Ajutor />} />

              {/* Admin-only */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <Register />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/devices"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <Devices />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DarkModeContext.Provider>
  )
}
