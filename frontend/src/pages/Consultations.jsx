import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, MapPin, Plus, X } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { consultations as initialConsults, patients } from '@/data/mock'
import { consultationAPI, patientAPI } from '@/services/api'
import { mapConsultationFromAPI, mapConsultationToAPI } from '@/services/mappers'

const today = new Date().toISOString().split('T')[0]

export default function Consultations() {
  const [consults, setConsults] = useState([])
  const [patients, setPatients] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConsult, setSelectedConsult] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState({
    patientId: '', type: '', date: today, time: '09:00',
    mode: 'In-Person', priority: 'Routine', physician: 'Dr. Sarah Chen', notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultsRes, patientsRes] = await Promise.all([
          consultationAPI.getAll().catch(() => []),
          patientAPI.getAll().catch(() => []),
        ])

        console.log('Consultations API Response:', consultsRes)
        console.log('Patients API Response:', patientsRes)

        // Use API data directly, no mock fallback
        const transformedConsults = consultsRes && consultsRes.length > 0
          ? consultsRes.map(mapConsultationFromAPI)
          : []

        setConsults(transformedConsults)
        setPatients(patientsRes || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setConsults([])
        setPatients([])
      }
    }

    fetchData()
  }, [])

  const itemsPerPage = 6
  const totalPages = Math.ceil(consults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedConsults = consults.slice(startIndex, startIndex + itemsPerPage)

  const handleCreate = async () => {
    if (!form.patientId || !form.type) {
      alert('Please select a patient and consultation type')
      return
    }

    try {
      const patient = patients.find(p => p.patientId === parseInt(form.patientId))
      const consultationData = {
        patientId: parseInt(form.patientId),
        doctorId: null,
        presentationReason: form.type,
        symptoms: form.notes || '',
        diagnosisCode: '',
        notes: form.notes || '',
      }

      const response = await consultationAPI.create(consultationData)
      const newConsult = mapConsultationFromAPI(response)
      if (patient) {
        newConsult.patientName = `Patient ${patient.patientId}`
      }

      setConsults(prev => [newConsult, ...prev])
      setDialogOpen(false)
      setForm({ patientId: '', type: '', date: today, time: '09:00', mode: 'In-Person', priority: 'Routine', physician: 'Dr. Sarah Chen', notes: '' })
    } catch (error) {
      console.error('Error creating consultation:', error)
      alert('Error creating consultation')
    }
  }

  const updateStatus = (id, status) => {
    setConsults(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    if (selectedConsult?.id === id) {
      setSelectedConsult(prev => ({ ...prev, status }))
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 space-y-5 flex-1 overflow-y-auto pb-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Consultatii</h1>
            <p className="text-sm text-slate-500 mt-0.5">{consults.length} consultatii înregistrate</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus size={15} /> Noua Consultatie
          </Button>
        </div>

        <div className="space-y-2">
          {paginatedConsults.map(c => (
          <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedConsult(c)}>
            <CardBody>
              <div className="flex items-start gap-4">
                <Avatar name={c.patientName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{c.patientName}</div>
                      <div className="text-sm text-slate-600">{c.type}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-semibold text-sm text-slate-800 flex items-center justify-end gap-1">
                        <Calendar size={14} />{c.date}
                      </div>
                      <div className="font-semibold text-sm text-slate-800 flex items-center justify-end gap-1">
                        <Clock size={14} />{c.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          ))}
          {consults.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">Nu sunt consultatii înregistrate.</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Următorul
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedConsult(null)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Detalii Consultatie</h2>
              <button onClick={() => setSelectedConsult(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Pacient</p>
                <p className="text-slate-800 font-semibold mt-1">{selectedConsult.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Tip Consultatie</p>
                <p className="text-slate-800 mt-1">{selectedConsult.type}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Data</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Ora</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Mod</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.mode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Physician</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.physician}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Prioritate</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Stare</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.status}</p>
                </div>
              </div>
              {selectedConsult.notes && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Note</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.notes}</p>
                </div>
              )}
            </CardBody>
            <div className="border-t border-slate-200 p-6 flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedConsult(null)} className="flex-1">Inchide</Button>
              {selectedConsult.status === 'Scheduled' && (
                <>
                  <Button variant="success" onClick={() => { updateStatus(selectedConsult.id, 'In Progress'); setSelectedConsult(null); }} className="flex-1">Start</Button>
                  <Button variant="danger" onClick={() => { updateStatus(selectedConsult.id, 'Cancelled'); setSelectedConsult(null); }} className="flex-1">Anulează</Button>
                </>
              )}
              {selectedConsult.status === 'In Progress' && (
                <Button onClick={() => { updateStatus(selectedConsult.id, 'Completed'); setSelectedConsult(null); }} className="flex-1">Finalizează</Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* New consultation dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Noua Consultatie" maxWidth="max-w-xl">
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Pacient *</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              >
                <option value="">Selectati pacient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Tip Consultatie *</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                placeholder="Ex. Evaluare Cardiologie"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ora</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mod</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                <option>În Persoană</option>
                <option>Telehealth</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prioritate</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option>Obișnuit</option>
                <option>Înalt</option>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Note clinice..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Anulează</Button>
          <Button onClick={handleCreate} disabled={!form.patientId || !form.type}>Creaza</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
