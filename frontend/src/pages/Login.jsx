import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Heart, Monitor, User } from 'lucide-react'

const roles = [
  {
    id: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    desc: 'Consultații, trimiteri, alarme de urgență',
    color: '#0f4c81',
    bg: '#dbeafe',
  },
  {
    id: 'caregiver',
    label: 'Ingrijitor',
    icon: Heart,
    desc: 'Tratamente în casă, înregistrare date medicale',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    id: 'supervisor',
    label: 'Supervizor',
    icon: Monitor,
    desc: 'Monitorizare serviciu, protocoale de urgență',
    color: '#d97706',
    bg: '#fef9c3',
  },
  {
    id: 'patient',
    label: 'Pacient',
    icon: User,
    desc: 'Consultă personal, revizuire înregistrări, introducere metrici',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('doctor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = e => {
    e.preventDefault()
    navigate('/')
  }

  const activeRole = roles.find(r => r.id === selectedRole)

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#eef2f7' }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#0f4c81' }}
          >
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Elderlynk</h1>
          <p className="text-slate-500 text-sm mt-1">Platform de Teleconcultare</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Alege-ți rolul</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map(r => {
              const Icon = r.icon
              const active = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className="p-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: active ? '#0f4c81' : '#e2e8f0',
                    backgroundColor: active ? '#f0f6ff' : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: r.bg }}
                  >
                    <Icon size={16} style={{ color: r.color }} />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{r.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-tight">{r.desc}</div>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors"
                style={{ '--tw-ring-color': '#0f4c81' }}
                placeholder="al@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0f4c81')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Parolă</label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0f4c81')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#0f4c81' }}
            >
              Autentificare ca {activeRole?.label}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
