import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, Radio,
  Bell, BellRing, Settings, ChevronLeft, ChevronRight, Activity,
} from 'lucide-react'
import { notifications, alarms } from '@/data/mock'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Tablou Bord',    end: true },
      { to: '/patients',    icon: Users,            label: 'Pacienți' },
      { to: '/live-alarms', icon: Bell,             label: 'Alarme Live' },
    ],
  },
  {
    label: 'Clinică',
    items: [
      { to: '/consultations', icon: Stethoscope, label: 'Consultații' },
      { to: '/sensor-config', icon: Radio,        label: 'Config Senzori' },
    ],
  },
  {
    label: 'General',
    items: [
      { to: '/notifications', icon: BellRing, label: 'Notificări' },
      { to: '/settings',      icon: Settings,  label: 'Setări' },
    ],
  },
]

const unreadNotif  = notifications.filter(n => !n.read).length
const activeAlarms = alarms.filter(a => a.status === 'Active').length

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30 select-none overflow-hidden transition-all duration-300 bg-white border-r border-slate-200"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 min-h-[68px]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#00b4d8' }}
        >
          <Activity size={16} color="#fff" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-800 text-sm leading-tight">Elderlynk</div>
            <div className="text-slate-400 text-xs uppercase tracking-wider">Platform de Teleconcultare</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={15} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors mx-auto"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
        {navGroups.map(group => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </div>
            )}
            {collapsed && <div className="my-2 border-t border-slate-100" />}
            {group.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `relative flex items-center rounded-lg mb-0.5 transition-all text-sm font-medium
                  ${collapsed ? 'justify-center px-0 py-2.5 gap-0' : 'px-3 py-2 gap-3'}
                  ${isActive
                    ? 'text-[#0f4c81] font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#eff6ff' } : {}}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: isActive ? '#0f4c81' : undefined }}
                    />
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                    {!collapsed && label === 'Live Alarms' && activeAlarms > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#0f4c81' }}
                      >
                        {activeAlarms}
                      </span>
                    )}
                    {!collapsed && label === 'Notifications' && unreadNotif > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#0f4c81' }}
                      >
                        {unreadNotif}
                      </span>
                    )}
                    {collapsed && (
                      (label === 'Live Alarms' && activeAlarms > 0) ||
                      (label === 'Notifications' && unreadNotif > 0)
                    ) && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#e63946' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User strip */}
      <div className="border-t border-slate-100 px-3 py-3">
        {collapsed ? (
          <div className="flex justify-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#00b4d8' }}
            >
              AR
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#00b4d8' }}
            >
              AR
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-700 truncate">Alin Rogojan</div>
              <div className="text-xs text-slate-400 truncate">alinrogojan1144@gmail.com</div>
            </div>
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  )
}
