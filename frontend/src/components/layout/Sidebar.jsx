import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, Radio,
  Bell, BellRing, Settings,
} from 'lucide-react'
import { notifications, alarms } from '@/data/mock'

const nav = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/patients',       icon: Users,            label: 'Patients' },
  { to: '/consultations',  icon: Stethoscope,      label: 'Consultations' },
  { to: '/sensor-config',  icon: Radio,            label: 'Sensor Config' },
  { to: '/live-alarms',    icon: Bell,             label: 'Live Alarms' },
  { to: '/notifications',  icon: BellRing,         label: 'Notifications' },
  { to: '/settings',       icon: Settings,         label: 'Settings' },
]

const unreadNotif  = notifications.filter(n => !n.read).length
const activeAlarms = alarms.filter(a => a.status === 'Active').length

const sidebarBg = {
  background: 'linear-gradient(180deg, #071d35 0%, #0a3560 40%, #0f4c81 100%)',
}

export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30 select-none"
      style={sidebarBg}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00b4d8' }}>
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Elderlynk</div>
            <div className="text-white/50 text-xs">Telecare Platform</div>
          </div>
        </div>
      </div>

      {/* Facility */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Facility</div>
        <div className="text-white/80 text-sm font-medium">Sunrise Care Center</div>
        <div className="text-white/40 text-xs">Ward A · Floor 2–4</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-sm font-medium ${
                isActive
                  ? 'bg-white/15 text-white border-l-2 border-[#00b4d8] pl-[10px]'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/8'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} style={{ color: isActive ? '#00b4d8' : undefined }} />
                <span className="flex-1">{label}</span>
                {label === 'Live Alarms' && activeAlarms > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#e63946', color: '#fff' }}>
                    {activeAlarms}
                  </span>
                )}
                {label === 'Notifications' && unreadNotif > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#e63946', color: '#fff' }}>
                    {unreadNotif}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User strip */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#00b4d8', color: '#fff' }}>
            SC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">Dr. Sarah Chen</div>
            <div className="text-white/50 text-xs">Attending Physician</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
