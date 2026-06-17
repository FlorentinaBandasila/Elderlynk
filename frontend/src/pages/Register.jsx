import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, KeyRound } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { authAPI, userAPI, patientAPI } from '@/services/api'
import { ROLES } from '@/context/AuthContext'

const staffRoles = [
  { id: ROLES.ADMIN, label: 'Administrator' },
  { id: ROLES.MEDIC, label: 'Medic' },
  { id: ROLES.SUPRAVEGHETOR, label: 'Supraveghetor' },
]

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f4c81]'

const fullName = (first, last, fallback) =>
  [first, last].filter(Boolean).join(' ') || fallback

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nume: '', prenume: '', email: '', parola: '', telefon: '', roleId: ROLES.MEDIC,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authAPI.register({
        email: form.email,
        parola: form.parola,
        nume: form.nume,
        prenume: form.prenume,
        telefon: form.telefon,
        roleId: Number(form.roleId),
      })
      setSuccess(`Contul pentru ${form.email} a fost creat.`)
      setForm({ nume: '', prenume: '', email: '', parola: '', telefon: '', roleId: ROLES.MEDIC })
    } catch (err) {
      setError(err.message || 'Eroare la crearea contului.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Înregistrare utilizator" subtitle="Creare cont de personal (Admin / Medic / Supraveghetor)" />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserPlus size={18} style={{ color: '#0f4c81' }} />
            <h2 className="font-semibold text-slate-800">Cont nou</h2>
          </div>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nume</label>
                <input className={inputClass} value={form.nume} onChange={set('nume')} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prenume</label>
                <input className={inputClass} value={form.prenume} onChange={set('prenume')} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" className={inputClass} value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Parolă</label>
              <input type="password" className={inputClass} value={form.parola} onChange={set('parola')} minLength={6} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Telefon</label>
              <input className={inputClass} value={form.telefon} onChange={set('telefon')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rol</label>
              <select className={inputClass} value={form.roleId} onChange={set('roleId')}>
                {staffRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60"
                style={{ backgroundColor: '#0f4c81' }}
              >
                {loading ? 'Se creează…' : 'Creează cont'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm"
              >
                Anulează
              </button>
            </div>
          </form>
        </div>

        <PasswordReset />
      </div>
    </>
  )
}

/** Admin tool: reset the password of any account — staff (Utilizatori) or patient (Pacienti). */
function PasswordReset() {
  // Combined account list: { key: 'user:5', userType, userId, label }
  const [accounts, setAccounts] = useState({ staff: [], patients: [] })
  const [selected, setSelected] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      userAPI.getAll().catch(() => []),
      patientAPI.getAll().catch(() => []),
    ]).then(([users, patients]) => {
      if (!active) return
      setAccounts({
        staff: (Array.isArray(users) ? users : []).map((u) => ({
          key: `user:${u.userId}`,
          userType: 'user',
          userId: u.userId,
          label: `${fullName(u.firstName, u.lastName, u.email)} · ${u.email}`,
        })),
        patients: (Array.isArray(patients) ? patients : [])
          .filter((p) => p.email) // only patients with an email can log in
          .map((p) => ({
            key: `patient:${p.patientId}`,
            userType: 'patient',
            userId: p.patientId,
            label: `${fullName(p.firstName, p.lastName, `Pacient ${p.patientId}`)} · ${p.email}`,
          })),
      })
    })
    return () => { active = false }
  }, [])

  const find = (key) =>
    [...accounts.staff, ...accounts.patients].find((a) => a.key === key)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const account = find(selected)
    if (!account) {
      setError('Selectați un cont.')
      return
    }
    setLoading(true)
    try {
      await authAPI.resetPassword({
        userType: account.userType,
        userId: account.userId,
        newPassword,
      })
      setSuccess(`Parola pentru ${account.label.split(' · ')[0]} a fost resetată.`)
      setSelected('')
      setNewPassword('')
    } catch (err) {
      setError(err.message || 'Eroare la resetarea parolei.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <KeyRound size={18} style={{ color: '#0f4c81' }} />
        <h2 className="font-semibold text-slate-800">Resetare parolă</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Setați o parolă nouă pentru orice cont — personal sau pacient.
      </p>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Cont</label>
          <select className={inputClass} value={selected} onChange={(e) => setSelected(e.target.value)} required>
            <option value="">Selectați un cont…</option>
            <optgroup label="Personal">
              {accounts.staff.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pacienți">
              {accounts.patients.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Parolă nouă</label>
          <input
            type="password"
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60"
            style={{ backgroundColor: '#0f4c81' }}
          >
            {loading ? 'Se resetează…' : 'Resetează parola'}
          </button>
        </div>
      </form>
    </div>
  )
}
