import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { authAPI } from '@/services/api'
import { ROLES } from '@/context/AuthContext'

const staffRoles = [
  { id: ROLES.ADMIN, label: 'Administrator' },
  { id: ROLES.MEDIC, label: 'Medic' },
  { id: ROLES.SUPRAVEGHETOR, label: 'Supraveghetor' },
]

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f4c81]'

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
      <div className="p-6 max-w-xl">
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
      </div>
    </>
  )
}
