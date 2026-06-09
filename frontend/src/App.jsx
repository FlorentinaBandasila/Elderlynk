import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import PatientDetail from '@/pages/PatientDetail'
import Consultations from '@/pages/Consultations'
import SensorConfig from '@/pages/SensorConfig'
import LiveAlarms from '@/pages/LiveAlarms'
import Notifications from '@/pages/Notifications'
import Settings from '@/pages/Settings'

export const DarkModeContext = createContext()

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/patients"      element={<Patients />} />
            <Route path="/patients/:id"  element={<PatientDetail />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/sensor-config" element={<SensorConfig />} />
            <Route path="/live-alarms"   element={<LiveAlarms />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings"      element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DarkModeContext.Provider>
  )
}
