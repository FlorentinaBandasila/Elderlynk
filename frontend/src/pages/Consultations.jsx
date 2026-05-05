import { useState } from 'react'
import { Calendar, Clock, Video, MapPin, Plus } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import TopBar from '@/components/layout/TopBar'
import { consultations as initialConsults, patients } from '@/data/mock'

const today = '2026-05-06'
const priorityVariant = { Urgent: 'red', High: 'orange', Routine: 'blue' }
const statusVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

export default function Consultations() {
  const [consults, setConsults] = useState(initialConsults)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    patientId: '', type: '', date: today, time: '09:00',
    mode: 'In-Person', priority: 'Routine', physician: 'Dr. Sarah Chen', notes: '',
  })

  const todayList    = consults.filter(c => c.date === today && c.status !== 'Cancelled')
  const upcomingList = consults.filter(c => c.date > today && c.status !== 'Cancelled')
  const historyList  = consults.filter(c => c.status === 'Completed' || c.status === 'Cancelled')

  const tabs = [
    { key: 'today',    label: "Today's",  count: todayList.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingList.length },
    { key: 'history',  label: 'History',  count: historyList.length },
  ]

  const updateStatus = (id, status) =>
    setConsults(prev => prev.map(c => c.id === id ? { ...c, status } : c))

  const handleCreate = () => {
    const patient = patients.find(p => p.id === form.patientId)
    if (!patient || !form.type) return
    const newConsult = {
      id: `c${Date.now()}`,
      patientName: patient.name,
      ...form,
      status: 'Scheduled',
    }
    setConsults(prev => [newConsult, ...prev])
    setDialogOpen(false)
    setForm({ patientId: '', type: '', date: today, time: '09:00', mode: 'In-Person', priority: 'Routine', physician: 'Dr. Sarah Chen', notes: '' })
  }

  const ConsultCard = ({ c }) => (
    <Card className="mb-3">
      <CardBody>
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={c.patientName} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-800">{c.patientName}</div>
                <div className="text-sm text-slate-600 mt-0.5">{c.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={priorityVariant[c.priority] || 'gray'}>{c.priority}</Badge>
                <Badge variant={statusVariant[c.status] || 'gray'}>{c.status}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={12} />{c.date}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{c.time}</span>
              <span className="flex items-center gap-1">
                {c.mode === 'Telehealth' ? <Video size={12} /> : <MapPin size={12} />}{c.mode}
              </span>
              <span>{c.physician}</span>
            </div>
            {c.notes && <div className="mt-2 text-xs text-slate-400 bg-slate-50 rounded px-2 py-1">{c.notes}</div>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {c.status === 'Scheduled' && (
              <>
                <Button size="sm" variant="success" onClick={() => updateStatus(c.id, 'In Progress')}>Start</Button>
                <Button size="sm" variant="danger" onClick={() => updateStatus(c.id, 'Cancelled')}>Cancel</Button>
              </>
            )}
            {c.status === 'In Progress' && (
              <Button size="sm" variant="primary" onClick={() => updateStatus(c.id, 'Completed')}>Complete</Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )

  const EmptyState = ({ label }) => (
    <div className="text-center py-10 text-slate-400 text-sm">{label}</div>
  )

  return (
    <div>
      <TopBar
        title="Consultations"
        subtitle="Manage patient consultations"
        action={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={14} /> New Consultation
          </Button>
        }
      />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Today", value: todayList.length, color: '#0f4c81', bg: '#dbeafe' },
            { label: "Upcoming", value: upcomingList.length, color: '#0891b2', bg: '#cffafe' },
            { label: "In Progress", value: consults.filter(c => c.status === 'In Progress').length, color: '#16a34a', bg: '#dcfce7' },
          ].map(s => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
                  {s.value}
                </div>
                <div className="text-sm font-medium text-slate-600">{s.label}</div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Tabs tabs={tabs}>
          {active => (
            <>
              {active === 'today' && (
                todayList.length === 0 ? <EmptyState label="No consultations scheduled for today." />
                  : todayList.map(c => <ConsultCard key={c.id} c={c} />)
              )}
              {active === 'upcoming' && (
                upcomingList.length === 0 ? <EmptyState label="No upcoming consultations." />
                  : upcomingList.map(c => <ConsultCard key={c.id} c={c} />)
              )}
              {active === 'history' && (
                historyList.length === 0 ? <EmptyState label="No consultation history." />
                  : historyList.map(c => <ConsultCard key={c.id} c={c} />)
              )}
            </>
          )}
        </Tabs>
      </div>

      {/* New consultation dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Consultation" maxWidth="max-w-xl">
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient *</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              >
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Consultation Type *</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                placeholder="e.g. Cardiology Review"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mode</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                <option>In-Person</option>
                <option>Telehealth</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option>Routine</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Physician</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.physician} onChange={e => setForm(f => ({ ...f, physician: e.target.value }))}>
                <option>Dr. Sarah Chen</option>
                <option>Dr. Michael Torres</option>
                <option>Dr. James Patel</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Clinical notes..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.patientId || !form.type}>Create</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
