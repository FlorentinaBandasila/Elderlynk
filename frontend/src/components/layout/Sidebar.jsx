import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, Radio,
  Bell, BellRing, Settings, ChevronLeft, ChevronRight, Activity,
  UserPlus, LogOut, HelpCircle, BarChart3,
} from 'lucide-react'
import { useAuth, ROLES, ROLE_LABELS } from '@/context/AuthContext'
import { useActiveAlarmCount } from '@/hooks/useAlarmBadge'

// `roles` lists the role ids allowed to see an item. Omit to allow everyone.
const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Tablou Bord',    end: true },
      { to: '/patients',    icon: Users,            label: 'Pacienți', roles: [ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR] },
      { to: '/live-alarms', icon: Bell,             label: 'Alarme Live', roles: [ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR] },
    ],
  },
  {
    label: 'Clinică',
    items: [
      { to: '/consultations', icon: Stethoscope, label: 'Consultații', roles: [ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR] },
      { to: '/sensor-config', icon: Radio,        label: 'Senzori', roles: [ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR] },
      { to: '/reports',       icon: BarChart3,    label: 'Rapoarte', roles: [ROLES.ADMIN, ROLES.MEDIC, ROLES.SUPRAVEGHETOR] },
    ],
  },
  {
    label: 'Administrare',
    items: [
      { to: '/register', icon: UserPlus, label: 'Utilizatori', roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'General',
    items: [
      { to: '/notifications', icon: BellRing,    label: 'Notificări' },
      { to: '/settings',      icon: Settings,    label: 'Setări' },
      { to: '/ajutor',        icon: HelpCircle,  label: 'Ajutor' },
    ],
  },
]

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  }
  return (email?.[0] ?? '?').toUpperCase()
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()
  const activeAlarms = useActiveAlarmCount()
  const unreadNotif = activeAlarms

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.some(r => hasRole(r))),
    }))
    .filter(group => group.items.length > 0)

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
            <div className="text-slate-400 text-xs uppercase tracking-wider">Platformă de Teleconsultare</div>
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
        {visibleGroups.map(group => (
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
                  }
                  ${isActive ? 'bg-[#eff6ff]' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: isActive ? '#0f4c81' : undefined }}
                    />
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                    {!collapsed && label === 'Alarme Live' && activeAlarms > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#0f4c81' }}
                      >
                        {activeAlarms}
                      </span>
                    )}
                    {!collapsed && label === 'Notificări' && unreadNotif > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#0f4c81' }}
                      >
                        {unreadNotif}
                      </span>
                    )}
                    {collapsed && (
                      (label === 'Alarme Live' && activeAlarms > 0) ||
                      (label === 'Notificări' && unreadNotif > 0)
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
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#00b4d8' }}
            >
              {initials(user?.nume, user?.email)}
            </div>
            <button onClick={handleLogout} title="Deconectare" className="text-slate-400 hover:text-red-500 p-1">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#00b4d8' }}
            >
              {initials(user?.nume, user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-700 truncate">{user?.nume || user?.email}</div>
              <div className="text-xs text-slate-400 truncate">{ROLE_LABELS[user?.role] ?? 'Utilizator'}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Deconectare"
              className="text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded hover:bg-slate-100 flex-shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
