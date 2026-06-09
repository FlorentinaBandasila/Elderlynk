import { useState } from 'react'
import { Search, Wifi, WifiOff, AlertCircle, Settings2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { sensors as initialSensors } from '@/data/mock'

function StatusPill({ status }) {
  const cfg = {
    Online:   { color: '#0369a1', bg: '#e0f2fe' },
    Offline:  { color: '#dc2626', bg: '#fee2e2' },
    Disabled: { color: '#64748b', bg: '#f1f5f9' },
  }[status] || { color: '#64748b', bg: '#f1f5f9' }

  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {status}
    </span>
  )
}

const patientNames = ['All', ...Array.from(new Set(initialSensors.map(s => s.patientName)))]

export default function SensorConfig() {
  const [sensors, setSensors]       = useState(initialSensors)
  const [editSensor, setEditSensor] = useState(null)
  const [form, setForm]             = useState({})
  const [search, setSearch]         = useState('')
  const [patientFilter, setPatient] = useState('All')
  const [statusFilter, setStatus]   = useState('All')

  const counts = {
    total:    sensors.length,
    Online:   sensors.filter(s => s.status === 'Online').length,
    Offline:  sensors.filter(s => s.status === 'Offline').length,
    Disabled: sensors.filter(s => s.status === 'Disabled').length,
  }

  const filtered = sensors.filter(s => {
    const matchSearch  = s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.patientName.toLowerCase().includes(search.toLowerCase()) ||
      s.room.toLowerCase().includes(search.toLowerCase())
    const matchPatient = patientFilter === 'All' || s.patientName === patientFilter
    const matchStatus  = statusFilter  === 'All' || s.status      === statusFilter
    return matchSearch && matchPatient && matchStatus
  })

  const openEdit = s => {
    setEditSensor(s)
    setForm({ status: s.status, sampleRate: s.sampleRate, thresholdMin: s.thresholdMin, thresholdMax: s.thresholdMax, location: s.location })
  }

  const saveEdit = () => {
    setSensors(prev => prev.map(s => s.id === editSensor.id ? { ...s, ...form } : s))
    setEditSensor(null)
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configurare Senzori</h1>
        <p className="text-slate-500 mt-1">Monitorizare stare hardware și configurare praguri pentru toate dispozitivele</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Senzori', value: counts.total,    icon: Settings2, iconColor: '#0f4c81', iconBg: '#dbeafe', status: null },
          { label: 'Online',        value: counts.Online,   icon: Wifi,      iconColor: '#0369a1', iconBg: '#e0f2fe', status: 'Online' },
          { label: 'Offline',       value: counts.Offline,  icon: WifiOff,   iconColor: '#dc2626', iconBg: '#fee2e2', status: 'Offline' },
          { label: 'Dezactivat',      value: counts.Disabled, icon: AlertCircle, iconColor: '#94a3b8', iconBg: '#f1f5f9', status: 'Disabled' },
        ].map(s => (
          <Card
            key={s.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatus(statusFilter === s.status ? 'All' : (s.status || 'All'))}
            style={statusFilter === s.status && s.status ? { borderColor: s.iconColor } : {}}
          >
            <CardBody className="flex items-start justify-between py-5">
              <div>
                <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                <div className="text-5xl font-bold text-slate-800 leading-none">{s.value}</div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.iconBg }}>
                <s.icon size={18} style={{ color: s.iconColor }} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 min-w-52 max-w-sm">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            placeholder="Cautati senzor, pacient sau camera..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={patientFilter}
          onChange={e => setPatient(e.target.value)}
          className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          {patientNames.map(n => <option key={n}>{n}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          {['Toti senzorii', 'Online', 'Offline', 'Dezactivat'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Sensor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-14 text-slate-400">
            Nu exista senzori care sa se potriveasca cu filtrele actuale.
          </div>
        )}
        {filtered.map(s => (
          <Card key={s.id} style={s.status === 'Offline' ? { borderColor: '#fca5a5' } : {}}>
            <CardBody className="p-5 space-y-4">

              {/* Name + status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 text-base">{s.type}</div>
                  <div className="text-sm text-slate-400 mt-0.5 truncate">
                    {s.patientName} · Camera {s.room}
                  </div>
                </div>
                <StatusPill status={s.status} />
              </div>

              {/* Chip model pill */}
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
              >
                {s.model}
              </div>

              {/* 2×2 details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Prag
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#0f4c81' }}>
                    {s.thresholdMin} – {s.thresholdMax}{' '}
                    <span className="font-normal text-slate-400">{s.unit}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Rata Esantionare
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    la fiecare {s.sampleRate}s
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Ultima Citire
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{s.lastValue}</div>
                </div>
              </div>

              {/* Configure button */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => openEdit(s)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <Settings2 size={14} style={{ color: '#0f4c81' }} />
                  Configure
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editSensor}
        onClose={() => setEditSensor(null)}
        title={`Configure — ${editSensor?.type}`}
      >
        <DialogBody className="space-y-4">
          <div
            className="text-sm rounded-xl px-4 py-2.5"
            style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
          >
            {editSensor?.patientName} · Room {editSensor?.room} · {editSensor?.model}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option>Online</option>
              <option>Offline</option>
              <option>Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Sample Rate (seconds)
            </label>
            <input
              type="number"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={form.sampleRate}
              onChange={e => setForm(f => ({ ...f, sampleRate: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Threshold Min
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
                value={form.thresholdMin}
                onChange={e => setForm(f => ({ ...f, thresholdMin: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Threshold Max
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
                value={form.thresholdMax}
                onChange={e => setForm(f => ({ ...f, thresholdMax: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Location
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditSensor(null)}>Cancel</Button>
          <Button onClick={saveEdit}>Save Changes</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
