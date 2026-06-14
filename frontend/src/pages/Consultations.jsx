import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, Video, MapPin, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
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
    patientId: '', presentationReason: '', symptoms: '', diagnosisCode: '', diagnosticText: '', referrals: '', generatedPrescriptions: '', notes: '',
    date: today, time: '09:00',
  })

  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true

    const fetchData = async () => {
      try {
        const [consultsRes, patientsRes] = await Promise.all([
          consultationAPI.getAll().catch(() => []),
          patientAPI.getAll().catch(() => []),
        ])

        // Create patient name map
        const patientNameMap = {}
        if (patientsRes && Array.isArray(patientsRes)) {
          patientsRes.forEach(p => {
            const firstName = p.firstName || p.FirstName || ''
            const lastName = p.lastName || p.LastName || ''
            const name = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Patient'
            patientNameMap[p.patientId || p.PatientId] = name
          })
        }

        // Transform consultations and map patient names
        const transformedConsults = consultsRes && consultsRes.length > 0
          ? consultsRes.map(consult => {
              const mapped = mapConsultationFromAPI(consult)
              const patientId = consult.patientId || consult.PatientId
              if (patientId && patientNameMap[patientId]) {
                mapped.patientName = patientNameMap[patientId]
              }
              return mapped
            }).sort((a, b) => new Date(b.date) - new Date(a.date))
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
    if (!form.patientId || !form.presentationReason) {
      alert('Please select a patient and presentation reason')
      return
    }

    try {
      const consultationDate = `${form.date}T${form.time}:00.000Z`
      const consultationData = {
        patientId: parseInt(form.patientId),
        doctorId: 1,
        consultationDate,
        presentationReason: form.presentationReason,
        symptoms: form.symptoms || '',
        diagnosisCode: form.diagnosisCode || '',
        diagnosticText: form.diagnosticText || '',
        referrals: form.referrals || '',
        generatedPrescriptions: form.generatedPrescriptions || '',
        notes: form.notes || '',
      }

      const response = await consultationAPI.create(consultationData)
      const newConsult = mapConsultationFromAPI(response)

      // Map patient name from the patients list
      const patient = patients.find(p => (p.patientId || p.id) === parseInt(form.patientId))
      if (patient) {
        const firstName = patient.firstName || patient.name?.split(' ')[0] || ''
        const lastName = patient.lastName || patient.name?.split(' ')[1] || ''
        newConsult.patientName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Patient'
      }

      setConsults(prev => [newConsult, ...prev])
      setDialogOpen(false)
      setForm({ patientId: '', presentationReason: '', symptoms: '', diagnosisCode: '', diagnosticText: '', referrals: '', generatedPrescriptions: '', notes: '', date: today, time: '09:00' })
    } catch (error) {
      console.error('Error creating consultation:', error)
      alert(`Error creating consultation: ${error.message}`)
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
          <div key={c.id} className="cursor-pointer" onClick={() => { console.log('Clicked consultation:', c); setSelectedConsult(c); }}>
            <Card className="hover:shadow-md transition-shadow">
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
          </div>
          ))}
          {consults.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">Nu sunt consultatii înregistrate.</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-slate-200 transition-colors ${
              currentPage === 1
                ? 'invisible'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft size={20} />
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
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setSelectedConsult(null)}>
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
                <p className="text-xs text-slate-500 font-medium uppercase">Motiv Prezentare</p>
                <p className="text-slate-800 mt-1">{selectedConsult.presentationReason || selectedConsult.type || '-'}</p>
              </div>
              {selectedConsult.symptoms && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Simptome</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.symptoms}</p>
                </div>
              )}
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
              {selectedConsult.diagnosisCode && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Cod Diagnostic</p>
                  <p className="text-slate-800 mt-1">{selectedConsult.diagnosisCode}</p>
                </div>
              )}
              {selectedConsult.diagnosticText && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Text Diagnostic</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.diagnosticText}</p>
                </div>
              )}
              {selectedConsult.referrals && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Trimiteri</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.referrals}</p>
                </div>
              )}
              {selectedConsult.generatedPrescriptions && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Retete Generate</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.generatedPrescriptions}</p>
                </div>
              )}
              {selectedConsult.notes && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Observatii</p>
                  <p className="text-slate-700 mt-1 text-sm">{selectedConsult.notes}</p>
                </div>
              )}
            </CardBody>
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
                {patients.map(p => {
                  const firstName = p.firstName || p.FirstName || ''
                  const lastName = p.lastName || p.LastName || ''
                  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Patient'
                  const patientId = p.patientId || p.PatientId
                  return <option key={patientId} value={patientId}>{name}</option>
                })}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Motiv Prezentare *</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                placeholder="Ex. Dureri de cap frecvente"
                value={form.presentationReason}
                onChange={e => setForm(f => ({ ...f, presentationReason: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Simptome</label>
              <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Ex. Cefalee, ameteala, oboseala"
                value={form.symptoms}
                onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Cod Diagnostic</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
                placeholder="Ex. G43.9"
                value={form.diagnosisCode}
                onChange={e => setForm(f => ({ ...f, diagnosisCode: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Text Diagnostic</label>
              <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Descriere diagnostic..."
                value={form.diagnosticText}
                onChange={e => setForm(f => ({ ...f, diagnosticText: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Trimiteri</label>
              <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Trimiteri..."
                value={form.referrals}
                onChange={e => setForm(f => ({ ...f, referrals: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Retete Generate</label>
              <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Retete..."
                value={form.generatedPrescriptions}
                onChange={e => setForm(f => ({ ...f, generatedPrescriptions: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Observatii</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none resize-none"
                placeholder="Observatii clinice..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Anulează</Button>
          <Button onClick={handleCreate} disabled={!form.patientId || !form.presentationReason}>Creaza</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
