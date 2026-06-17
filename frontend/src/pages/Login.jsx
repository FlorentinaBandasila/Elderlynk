import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, SESSION_EXPIRED_KEY } from '@/context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(false)

  // Show "session expired" when redirected here by inactivity / token expiry.
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_EXPIRED_KEY)) {
      setExpired(true)
      sessionStorage.removeItem(SESSION_EXPIRED_KEY)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setExpired(false)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message?.includes('401') || err.message?.includes('incorecte')
        ? 'Email sau parolă incorecte.'
        : (err.message || 'Autentificare eșuată.'))
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-slate-500 text-sm mt-1">Platformă de Teleconsultare</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Autentificare</h2>
          <p className="text-xs text-slate-500 mb-5">
            Introduceți datele de acces. Rolul este determinat automat.
          </p>

          {expired && !error && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Sesiunea a expirat. Autentificați-vă din nou.
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors"
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
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: '#0f4c81' }}
            >
              {loading ? 'Se autentifică…' : 'Autentificare'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
