import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  HelpCircle, Mail, Phone, BookOpen, AlertTriangle,
  Activity, Users, Stethoscope, Radio, CheckCircle,
} from 'lucide-react'

const quickActions = [
  {
    icon: Users,
    title: 'Adaugă un pacient nou',
    desc: 'Mergi la secțiunea "Pacienți" din meniu și apasă butonul "Adaugă Pacient". Completează datele personale și salvează.',
  },
  {
    icon: Radio,
    title: 'Configurează senzorii',
    desc: 'Accesează "Senzori" din meniu, selectează pacientul și asociază senzorii disponibili. Asigură-te că senzorii sunt porniți și în raza de semnal.',
  },
  {
    icon: AlertTriangle,
    title: 'Gestionează alarmele',
    desc: 'În "Alarme Live" poți vedea toate alarmele active. Apasă pe o alarmă pentru a o recunoaște sau rezolva. Alarmele critice sunt marcate cu roșu.',
  },
  {
    icon: Stethoscope,
    title: 'Adaugă o consultație',
    desc: 'Din secțiunea "Consultații" apasă "Consultație Nouă", selectează pacientul, completează observațiile și salvează fișa.',
  },
  {
    icon: Activity,
    title: 'Monitorizează semnele vitale',
    desc: 'Intră în profilul unui pacient pentru a vedea istoricul semnelor vitale, graficele de tendință și alertele recente.',
  },
  {
    icon: BookOpen,
    title: 'Gestionează conturile',
    desc: 'Administratorii pot adăuga sau dezactiva conturi din secțiunea "Utilizatori". Rolurile disponibile sunt: Admin, Medic și Supraveghetor.',
  },
]

export default function Ajutor() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!message.trim()) return
    const mailto = `mailto:support@elderlynk.ro?subject=${encodeURIComponent(subject || 'Întrebare platformă Elderlynk')}&body=${encodeURIComponent(message)}`
    window.location.href = mailto
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Ajutor & Suport</h1>
        <p className="text-slate-500 mt-1">Ghiduri rapide și contact direct cu echipa noastră</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="flex items-center gap-4 rounded-xl px-5 py-4"
          style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#0f4c81' }}
          >
            <Mail size={18} color="#fff" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Email suport</div>
            <div className="text-xs text-slate-500">support@elderlynk.ro</div>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-xl px-5 py-4"
          style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#16a34a' }}
          >
            <Phone size={18} color="#fff" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Telefon urgențe tehnice</div>
            <div className="text-xs text-slate-500">+40 700 000 000 · L–V, 08:00–20:00</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-[#0f4c81]" />
            <h3 className="font-semibold text-slate-800">Acțiuni rapide & Întrebări frecvente</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-3 p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#eff6ff' }}
                >
                  <Icon size={15} style={{ color: '#0f4c81' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Email form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#0f4c81]" />
            <h3 className="font-semibold text-slate-800">Trimite un email cu întrebarea ta</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subiect</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0f4c81] transition-colors"
              placeholder="ex: Problemă cu senzorii pacientului..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mesajul tău</label>
            <textarea
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0f4c81] transition-colors resize-none"
              placeholder="Descrie problema sau întrebarea ta cât mai detaliat..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Se va deschide clientul tău de email cu mesajul pre-completat.
            </p>
            <div className="flex items-center gap-3">
              {sent && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={14} />
                  Email deschis!
                </span>
              )}
              <Button onClick={handleSend} disabled={!message.trim()}>
                <Mail size={14} className="mr-1.5" />
                Trimite întrebarea
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
