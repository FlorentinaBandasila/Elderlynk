import { useState } from 'react'
import { Wifi, WifiOff, AlertCircle, Edit2 } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import TopBar from '@/components/layout/TopBar'
import { sensors as initialSensors } from '@/data/mock'

function BatteryBar({ level }) {
  const color = level > 50 ? '#16a34a' : level > 20 ? '#d97706' : '#e63946'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${level}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-slate-500 w-7 text-right">{level}%</span>
    </div>
  )
}

function StatusIcon({ status }) {
  if (status === 'Online')   return <Wifi size={16} style={{ color: '#16a34a' }} />
  if (status === 'Offline')  return <WifiOff size={16} style={{ color: '#e63946' }} />
  return <AlertCircle size={16} style={{ color: '#94a3b8' }} />
}

export default function SensorConfig() {
  const [sensors, setSensors] = useState(initialSensors)
  const [editSensor, setEditSensor] = useState(null)
  const [form, setForm]     = useState({})
  const [statusFilter, setStatusFilter] = useState('All')

  const counts = {
    Online:   sensors.filter(s => s.status === 'Online').length,
    Offline:  sensors.filter(s => s.status === 'Offline').length,
    Disabled: sensors.filter(s => s.status === 'Disabled').length,
  }

  const openEdit = s => {
    setEditSensor(s)
    setForm({ status: s.status, sampleRate: s.sampleRate, thresholdMin: s.thresholdMin, thresholdMax: s.thresholdMax, location: s.location })
  }

  const saveEdit = () => {
    setSensors(prev => prev.map(s => s.id === editSensor.id ? { ...s, ...form } : s))
    setEditSensor(null)
  }

  const filtered = statusFilter === 'All' ? sensors : sensors.filter(s => s.status === statusFilter)

  return (
    <div>
      <TopBar title="Sensor Config" subtitle="Monitor and configure patient sensors" />
      <div className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Online', count: counts.Online, color: '#16a34a', bg: '#dcfce7', variant: 'green' },
            { label: 'Offline', count: counts.Offline, color: '#e63946', bg: '#fee2e2', variant: 'red' },
            { label: 'Disabled', count: counts.Disabled, color: '#64748b', bg: '#f1f5f9', variant: 'gray' },
          ].map(s => (
            <Card
              key={s.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter(statusFilter === s.label ? 'All' : s.label)}
              style={statusFilter === s.label ? { borderColor: s.color } : {}}
            >
              <CardBody className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
                  {s.count}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">{s.label} Sensors</div>
                  <Badge variant={s.variant} className="mt-1">{s.label}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Sensor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Card key={s.id} style={s.status === 'Offline' ? { borderColor: '#fca5a5' } : {}}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={s.status} />
                    <span className="font-semibold text-slate-800 text-sm">{s.type}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                    <Edit2 size={13} />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-medium text-slate-700">{s.patientName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Room</span>
                  <span className="font-medium text-slate-700">{s.room}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Model</span>
                  <span className="text-slate-600">{s.model}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-600">{s.location}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Sample Rate</span>
                  <span className="text-slate-600">{s.sampleRate}s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Threshold</span>
                  <span className="text-slate-600">{s.thresholdMin} – {s.thresholdMax}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Battery</span>
                  </div>
                  <BatteryBar level={s.battery} />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-400">Last reading</span>
                  <span className="text-xs text-slate-500">{new Date(s.lastReading).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editSensor} onClose={() => setEditSensor(null)} title={`Edit Sensor — ${editSensor?.type}`}>
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
              value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Online</option>
              <option>Offline</option>
              <option>Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Sample Rate (seconds)</label>
            <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
              value={form.sampleRate} onChange={e => setForm(f => ({ ...f, sampleRate: Number(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Threshold Min</label>
              <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.thresholdMin} onChange={e => setForm(f => ({ ...f, thresholdMin: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Threshold Max</label>
              <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.thresholdMax} onChange={e => setForm(f => ({ ...f, thresholdMax: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
              value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
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
