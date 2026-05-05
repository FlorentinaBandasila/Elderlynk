import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import PatientDetail from '@/pages/PatientDetail'
import Consultations from '@/pages/Consultations'
import SensorConfig from '@/pages/SensorConfig'
import LiveAlarms from '@/pages/LiveAlarms'
import Notifications from '@/pages/Notifications'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
  )
}
