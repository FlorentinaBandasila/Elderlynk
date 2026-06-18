import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, Video, MapPin, Plus, X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import RepeatSection, { inputClass } from '@/components/ui/RepeatSection'
import SearchSelect from '@/components/ui/SearchSelect'
import { consultationAPI, patientAPI } from '@/services/api'
import { mapConsultationFromAPI, mapConsultationToAPI } from '@/services/mappers'
import { ICD9_CODES, getDiagnosticByCode } from '@/data/icd9'

const ICD9_OPTIONS = ICD9_CODES.map(c => ({ value: c.code, label: c.label }))

const today = new Date().toISOString().split('T')[0]

const EMPTY_ALLERGY = { denumire: '' }
const EMPTY_RECOMMENDATION = { tipRecomandare: '', descriere: '' }
const EMPTY_MEDICATION = { denumireMedicament: '', doza: '', frecventaAdministrare: '', durataTratament: '', observatiiIngrijitor: '' }

const EMPTY_FORM = {
  patientId: '', presentationReason: '', symptoms: '', diagnosisCode: '', diagnosticText: '', referrals: '', generatedPrescriptions: '', notes: '',
  date: today, time: '09:00',
}

export default function Consultations() {
  const [consults, setConsults] = useState([])
  const [patients, setPatients] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConsult, setSelectedConsult] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [allergies, setAllergies] = useState([{ ...EMPTY_ALLERGY }])
  const [recommendations, setRecommendations] = useState([{ ...EMPTY_RECOMMENDATION }])
  const [medications, setMedications] = useState([{ ...EMPTY_MEDICATION }])
  const [detailRecs, setDetailRecs] = useState([])
  const [detailMeds, setDetailMeds] = useState([])

  const effectRan = useRef(false)

  // Open the details modal and load the medical data attached to that consultation.
  const openDetails = async (c) => {
    setSelectedConsult(c)
    setDetailRecs([])
    setDetailMeds([])
    try {
      const [recs, meds] = await Promise.all([
        consultationAPI.getRecommendations(c.consultationId).catch(() => []),
        consultationAPI.getMedications(c.consultationId).catch(() => []),
      ])
      setDetailRecs(Array.isArray(recs) ? recs : [])
      setDetailMeds(Array.isArray(meds) ? meds : [])
    } catch (err) {
      console.error('Error fetching consultation medical data:', err)
    }
  }

  const closeDetails = () => {
    setSelectedConsult(null)
    setDetailRecs([])
    setDetailMeds([])
  }

  // Build a styled, printable document and trigger the browser's "Save as PDF".
  const exportPdf = () => {
    const c = selectedConsult
    if (!c) return
    const esc = (s) => String(s ?? '').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))
    const row = (label, value) => value ? `<tr><td class="lbl">${esc(label)}</td><td>${esc(value)}</td></tr>` : ''

    const recsHtml = detailRecs.length
      ? `<h2>Recomandări medicale</h2><ul>${detailRecs.map(r =>
          `<li><strong>${esc(r.tipRecomandare || 'Recomandare')}:</strong> ${esc(r.descriere)}</li>`).join('')}</ul>`
      : ''
    const medsHtml = detailMeds.length
      ? `<h2>Scheme de medicație</h2><ul>${detailMeds.map(m =>
          `<li><strong>${esc(m.denumireMedicament)}</strong> · ${esc(m.doza)}${
            [m.frecventaAdministrare, m.durataTratament].filter(Boolean).map(esc).join(' · ') ? ' — ' + [m.frecventaAdministrare, m.durataTratament].filter(Boolean).map(esc).join(' · ') : ''
          }${m.observatiiIngrijitor ? `<br/><span class="muted">${esc(m.observatiiIngrijitor)}</span>` : ''}</li>`).join('')}</ul>`
      : ''

    const html = `<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"/>
      <title>Consultatie ${esc(c.patientName)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; }
        .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f4c81; padding-bottom: 16px; margin-bottom: 24px; }
        .brand h1 { color: #0f4c81; margin: 0; font-size: 26px; letter-spacing: .5px; }
        .brand .tag { color: #64748b; font-size: 12px; }
        .brand .meta { text-align: right; color: #64748b; font-size: 12px; }
        h2 { color: #0f4c81; font-size: 15px; margin: 24px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 6px 8px; vertical-align: top; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        td.lbl { width: 200px; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        ul { margin: 6px 0; padding-left: 20px; font-size: 13px; }
        li { margin-bottom: 6px; }
        .muted { color: #64748b; font-size: 12px; }
        .footer { margin-top: 40px; color: #94a3b8; font-size: 11px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
      </style></head>
      <body>
        <div class="brand">
          <div>
            <h1>Elderlynk</h1>
            <div class="tag">Sistem de monitorizare medicală</div>
          </div>
          <div class="meta">
            Fișă consultație<br/>
            Generat: ${esc(new Date().toLocaleString('ro-RO'))}
          </div>
        </div>
        <table>
          ${row('Pacient', c.patientName)}
          ${row('Medic', c.doctorName || c.physician)}
          ${row('Data', c.date)}
          ${row('Ora', c.time)}
          ${row('Motiv prezentare', c.presentationReason || c.type)}
          ${row('Simptome', c.symptoms)}
          ${row('Cod diagnostic', c.diagnosisCode)}
          ${row('Text diagnostic', c.diagnosticText)}
          ${row('Trimiteri', c.referrals)}
          ${row('Rețete generate', c.generatedPrescriptions)}
          ${row('Observații', c.notes)}
        </table>
        ${recsHtml}
        ${medsHtml}
        <div class="footer">© ${new Date().getFullYear()} Elderlynk · Document confidențial</div>
        <script>window.onload = function () { window.print(); };</script>
      </body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      alert('Permiteți ferestrele pop-up pentru a exporta PDF-ul.')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  // Generic helpers for the repeatable medical sections.
  const updateRow = (setter, index, field, value) =>
    setter(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  const addRow = (setter, empty) => setter(prev => [...prev, { ...empty }])
  const removeRow = (setter, index) =>
    setter(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))

  const resetForm = () => {
    setStep(1)
    setForm({ ...EMPTY_FORM })
    setAllergies([{ ...EMPTY_ALLERGY }])
    setRecommendations([{ ...EMPTY_RECOMMENDATION }])
    setMedications([{ ...EMPTY_MEDICATION }])
  }

  const closeDialog = () => {
    setDialogOpen(false)
    resetForm()
  }

  const openDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const validateStep1 = () => {
    if (!form.patientId || !form.presentationReason) {
      alert('Selectați un pacient și completați motivul prezentării.')
      return false
    }
    return true
  }

  const goToStep2 = () => {
    if (validateStep1()) setStep(2)
  }

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
            const name = [firstName, lastName].filter(Boolean).join(' ') || 'Pacient necunoscut'
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
    if (!validateStep1()) return

    setSubmitting(true)
    try {
      const t = (v) => (v ? v.trim() : '')
      const orNull = (v) => (t(v) ? t(v) : null)
      const consultationDate = `${form.date}T${form.time}:00.000Z`

      // doctorId is assigned server-side from the signed-in user.
      const consultationData = {
        patientId: parseInt(form.patientId),
        consultationDate,
        presentationReason: form.presentationReason,
        symptoms: form.symptoms || '',
        diagnosisCode: form.diagnosisCode || '',
        diagnosticText: form.diagnosticText || '',
        referrals: form.referrals || '',
        generatedPrescriptions: form.generatedPrescriptions || '',
        notes: form.notes || '',
        allergies: allergies
          .filter(a => t(a.denumire))
          .map(a => ({ denumire: t(a.denumire) })),
        recommendations: recommendations
          .filter(r => t(r.descriere))
          .map(r => ({ tipRecomandare: orNull(r.tipRecomandare), descriere: t(r.descriere) })),
        medications: medications
          .filter(m => t(m.denumireMedicament) && t(m.doza))
          .map(m => ({
            denumireMedicament: t(m.denumireMedicament),
            doza: t(m.doza),
            frecventaAdministrare: orNull(m.frecventaAdministrare),
            durataTratament: orNull(m.durataTratament),
            observatiiIngrijitor: orNull(m.observatiiIngrijitor),
          })),
      }

      const response = await consultationAPI.create(consultationData)
      const newConsult = mapConsultationFromAPI(response)

      // Map patient name from the patients list
      const patient = patients.find(p => (p.patientId || p.id) === parseInt(form.patientId))
      if (patient) {
        const firstName = patient.firstName || patient.name?.split(' ')[0] || ''
        const lastName = patient.lastName || patient.name?.split(' ')[1] || ''
        newConsult.patientName = [firstName, lastName].filter(Boolean).join(' ') || 'Pacient necunoscut'
      }

      setConsults(prev => [newConsult, ...prev])
      closeDialog()
    } catch (error) {
      console.error('Error creating consultation:', error)
      alert(`Eroare la crearea consultației: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Save with consultation details only — the medical step is optional.
  const handleSaveFromStep1 = () => {
    if (validateStep1()) handleCreate()
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
          <Button onClick={openDialog}>
            <Plus size={15} /> Noua Consultatie
          </Button>
        </div>

        <div className="space-y-2">
          {paginatedConsults.map(c => (
          <div key={c.id} className="cursor-pointer" onClick={() => openDetails(c)}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={closeDetails}>
          <Card className="w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Detalii Consultatie</h2>
              <button onClick={closeDetails} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <CardBody className="space-y-4 overflow-y-auto">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Pacient</p>
                <p className="text-slate-800 font-semibold mt-1">{selectedConsult.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Medic</p>
                <p className="text-slate-800 mt-1">{selectedConsult.doctorName || selectedConsult.physician || 'Necunoscut'}</p>
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

              {detailRecs.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Recomandări Medicale</p>
                  <ul className="mt-1 space-y-1">
                    {detailRecs.map(r => (
                      <li key={r.recommendationId} className="text-sm text-slate-700">
                        <span className="font-medium">{r.tipRecomandare || 'Recomandare'}:</span> {r.descriere}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailMeds.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Scheme de Medicație</p>
                  <ul className="mt-1 space-y-1">
                    {detailMeds.map(m => (
                      <li key={m.medicationId} className="text-sm text-slate-700">
                        <span className="font-medium">{m.denumireMedicament}</span> · {m.doza}
                        {[m.frecventaAdministrare, m.durataTratament].filter(Boolean).length > 0 && (
                          <span className="text-slate-500"> — {[m.frecventaAdministrare, m.durataTratament].filter(Boolean).join(' · ')}</span>
                        )}
                        {m.observatiiIngrijitor && <div className="text-xs text-slate-400">{m.observatiiIngrijitor}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
            <div className="p-4 border-t border-slate-200 flex justify-end flex-shrink-0">
              <Button onClick={exportPdf}>
                <Download size={15} /> Exportă PDF
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* New consultation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={step === 1 ? 'Noua Consultatie · Detalii' : 'Noua Consultatie · Date medicale'}
        maxWidth="max-w-3xl"
      >
        <DialogBody className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'text-white' : 'text-slate-500 bg-slate-100'}`} style={step === 1 ? { backgroundColor: '#0f4c81' } : {}}>1 · Detalii consultație</span>
            <span className="text-slate-300">→</span>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'text-white' : 'text-slate-500 bg-slate-100'}`} style={step === 2 ? { backgroundColor: '#0f4c81' } : {}}>2 · Date medicale</span>
          </div>

          {step === 1 ? (
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
                    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Pacient necunoscut'
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Cod Diagnostic (ICD-9)</label>
                <SearchSelect
                  options={ICD9_OPTIONS}
                  value={form.diagnosisCode}
                  onChange={(code) =>
                    setForm(f => ({
                      ...f,
                      diagnosisCode: code,
                      // Pre-completează textul diagnosticului dacă e gol sau corespunde codului anterior.
                      diagnosticText:
                        !f.diagnosticText || f.diagnosticText === getDiagnosticByCode(f.diagnosisCode)
                          ? getDiagnosticByCode(code)
                          : f.diagnosticText,
                    }))
                  }
                  placeholder="Selectați un diagnostic..."
                  searchPlaceholder="Căutați cod sau diagnostic..."
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
          ) : (
            <div className="space-y-6">
              {/* Alergii */}
              <RepeatSection
                title="Alergii"
                rows={allergies}
                onAdd={() => addRow(setAllergies, EMPTY_ALLERGY)}
                onRemove={(i) => removeRow(setAllergies, i)}
                renderRow={(row, i) => (
                  <input
                    className={inputClass}
                    placeholder="Ex: Penicilină"
                    value={row.denumire}
                    onChange={e => updateRow(setAllergies, i, 'denumire', e.target.value)}
                  />
                )}
              />

              {/* Recomandări medicale */}
              <RepeatSection
                title="Recomandări medicale"
                rows={recommendations}
                onAdd={() => addRow(setRecommendations, EMPTY_RECOMMENDATION)}
                onRemove={(i) => removeRow(setRecommendations, i)}
                renderRow={(row, i) => (
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Tip recomandare" value={row.tipRecomandare}
                      onChange={e => updateRow(setRecommendations, i, 'tipRecomandare', e.target.value)} />
                    <input className={inputClass} placeholder="Descriere *" value={row.descriere}
                      onChange={e => updateRow(setRecommendations, i, 'descriere', e.target.value)} />
                  </div>
                )}
              />

              {/* Scheme de medicație */}
              <RepeatSection
                title="Scheme de medicație"
                rows={medications}
                onAdd={() => addRow(setMedications, EMPTY_MEDICATION)}
                onRemove={(i) => removeRow(setMedications, i)}
                renderRow={(row, i) => (
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Denumire medicament *" value={row.denumireMedicament}
                      onChange={e => updateRow(setMedications, i, 'denumireMedicament', e.target.value)} />
                    <input className={inputClass} placeholder="Doză *" value={row.doza}
                      onChange={e => updateRow(setMedications, i, 'doza', e.target.value)} />
                    <input className={inputClass} placeholder="Frecvență administrare" value={row.frecventaAdministrare}
                      onChange={e => updateRow(setMedications, i, 'frecventaAdministrare', e.target.value)} />
                    <input className={inputClass} placeholder="Durată tratament" value={row.durataTratament}
                      onChange={e => updateRow(setMedications, i, 'durataTratament', e.target.value)} />
                    <input className={`${inputClass} col-span-2`} placeholder="Observații îngrijitor" value={row.observatiiIngrijitor}
                      onChange={e => updateRow(setMedications, i, 'observatiiIngrijitor', e.target.value)} />
                  </div>
                )}
              />
              <p className="text-xs text-slate-400">
                Câmpurile marcate cu * sunt obligatorii pentru a salva rândul.
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={closeDialog}>Anulează</Button>
              <Button variant="ghost" onClick={handleSaveFromStep1} disabled={submitting}>
                {submitting ? 'Se salvează...' : 'Creează fără date medicale'}
              </Button>
              <Button onClick={goToStep2}>Continuă →</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>← Înapoi</Button>
              <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Se salvează...' : 'Creează'}</Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  )
}
