import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#eef2f7' }}>
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fee2e2' }}>
          <ShieldAlert size={28} style={{ color: '#dc2626' }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Acces interzis</h1>
        <p className="text-slate-500 mt-2 max-w-sm">
          Nu aveți permisiunea necesară pentru a accesa această pagină.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-2.5 rounded-lg text-white font-semibold text-sm"
          style={{ backgroundColor: '#0f4c81' }}
        >
          Înapoi la Tabloul de Bord
        </Link>
      </div>
    </div>
  )
}
