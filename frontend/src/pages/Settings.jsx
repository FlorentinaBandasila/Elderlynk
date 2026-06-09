import { useState, useContext } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DarkModeContext } from '@/App'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ backgroundColor: checked ? '#0f4c81' : '#e2e8f0' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

export default function Settings() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext)

  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Chen', email: 'sarah.chen@sunrisecare.org',
    role: 'Attending Physician', facility: 'Sunrise Care Center',
  })

  const [alerts, setAlerts] = useState({
    criticalAlarms: true, highAlarms: true, mediumAlarms: false,
    sensorOffline: true, batteryLow: false,
  })

  const [delivery, setDelivery] = useState({
    emailNotifications: true, pushNotifications: true, smsAlerts: false,
  })

  const [display, setDisplay] = useState({
    compactMode: false, showVitalWarnings: true, autoRefresh: true,
  })

  const toggle = (group, setter) => key =>
    setter(prev => ({ ...prev, [key]: !prev[key] }))

  const Section = ({ title, children }) => (
    <Card>
      <CardHeader><h3 className="font-semibold text-slate-800">{title}</h3></CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  )

  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Setari</h1>
        <p className="text-slate-500 mt-1">Gestionare cont și preferințe</p>
      </div>

        <Section title="Profil">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nume Complet', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Rol', key: 'role' },
              { label: 'Facilitati', key: 'facility' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0f4c81] transition-colors"
                  value={profile[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm">Salveaza Profil</Button>
          </div>
        </Section>

        <Section title="Preferinte Alerte">
          <ToggleRow label="Alarme Critice" desc="Primiti alerte pentru alarme de severitate critica"
            checked={alerts.criticalAlarms} onChange={v => setAlerts(p => ({ ...p, criticalAlarms: v }))} />
          <ToggleRow label="Alarme Înalte" desc="Primiti alerte pentru alarme de severitate înalta"
            checked={alerts.highAlarms} onChange={v => setAlerts(p => ({ ...p, highAlarms: v }))} />
          <ToggleRow label="Alarme Medii" desc="Primiti alerte pentru alarme de severitate medie"
            checked={alerts.mediumAlarms} onChange={v => setAlerts(p => ({ ...p, mediumAlarms: v }))} />
          <ToggleRow label="Senzor Offline" desc="Alerta cand un senzor se deconecteaza"
            checked={alerts.sensorOffline} onChange={v => setAlerts(p => ({ ...p, sensorOffline: v }))} />
          <ToggleRow label="Baterie Scazuta" desc="Alerta cand bateria senzorului scade sub 20%"
            checked={alerts.batteryLow} onChange={v => setAlerts(p => ({ ...p, batteryLow: v }))} />
        </Section>

        <Section title="Canale Livrare">
          <ToggleRow label="Notificari Email" checked={delivery.emailNotifications}
            onChange={v => setDelivery(p => ({ ...p, emailNotifications: v }))} />
          <ToggleRow label="Notificari Push" checked={delivery.pushNotifications}
            onChange={v => setDelivery(p => ({ ...p, pushNotifications: v }))} />
          <ToggleRow label="Alerte SMS" desc="Numai alarme critice"
            checked={delivery.smsAlerts} onChange={v => setDelivery(p => ({ ...p, smsAlerts: v }))} />
        </Section>

        <Section title="Preferinte Afisare">
          <ToggleRow label="Mod Compact" desc="Reduceti padding si spatiu cartilor"
            checked={display.compactMode} onChange={v => setDisplay(p => ({ ...p, compactMode: v }))} />
          <ToggleRow label="Avertismente Vitale" desc="Evidentiati semnele vitale anormale in rosu"
            checked={display.showVitalWarnings} onChange={v => setDisplay(p => ({ ...p, showVitalWarnings: v }))} />
          <ToggleRow label="Reîncarcacare Automata" desc="Reîncarcacare alarme si date senzori la 30s"
            checked={display.autoRefresh} onChange={v => setDisplay(p => ({ ...p, autoRefresh: v }))} />
          <ToggleRow label="Mod Întunecat" desc="Activeaza tema întunecata pentru ochi mai comozi"
            checked={darkMode} onChange={setDarkMode} />
        </Section>

        <Section title="Securitate">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Schimbati Parola</div>
              <div className="text-xs text-slate-400 mt-0.5">Ultima schimbare acum 90 de zile</div>
            </div>
            <Button variant="outline" size="sm">Schimbati</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Autentificare Doi Factori</div>
              <div className="text-xs text-slate-400 mt-0.5">Adaugati un strat suplimentar de securitate</div>
            </div>
            <Button variant="outline" size="sm">Activati</Button>
          </div>
        </Section>
    </div>
  )
}
