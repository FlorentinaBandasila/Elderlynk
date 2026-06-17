import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import RepeatSection, { inputClass } from '@/components/ui/RepeatSection'
import { patientAPI } from '@/services/api'
import { mapPatientFromAPI } from '@/services/mappers'
import { useAuth, ROLES } from '@/context/AuthContext'

const EMPTY_DEMOGRAPHICS = {
  lastName: '', firstName: '', cnp: '',
  street: '', city: '', county: '', postalCode: '',
  phone: '', email: '', profession: '', workplace: '', caregiverId: '',
}
// Validează un CNP românesc: 13 cifre, dată de naștere plauzibilă și cifra de control.
const CNP_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
function isValidCNP(cnp) {
  if (!/^\d{13}$/.test(cnp) || cnp[0] === '0') return false

  const year = parseInt(cnp.substring(1, 3), 10)
  const month = parseInt(cnp.substring(3, 5), 10)
  const day = parseInt(cnp.substring(5, 7), 10)
  const century = { 1: 1900, 2: 1900, 3: 1800, 4: 1800, 5: 2000, 6: 2000, 7: 1900, 8: 1900, 9: 1900 }[cnp[0]]
  const fullYear = century + year
  const date = new Date(fullYear, month - 1, day)
  if (date.getFullYear() !== fullYear || date.getMonth() !== month - 1 || date.getDate() !== day) return false

  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(cnp[i], 10) * CNP_WEIGHTS[i]
  let control = sum % 11
  if (control === 10) control = 1
  return control === parseInt(cnp[12], 10)
}

const EMPTY_ALLERGY = { denumire: '' }
const EMPTY_HISTORY = { diagnostic: '', tratament: '', dataDiagnostic: '', observatii: '' }
const EMPTY_RECOMMENDATION = { tipRecomandare: '', descriere: '' }
const EMPTY_MEDICATION = { denumireMedicament: '', doza: '', frecventaAdministrare: '', durataTratament: '', observatiiIngrijitor: '' }

export default function Patients() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const canAddPatient = hasRole(ROLES.ADMIN) || hasRole(ROLES.MEDIC)
  const [patients, setPatients]   = useState([])
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]       = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const hasInitialized = React.useRef(false)

  // ===== Add-patient form state =====
  const [formData, setFormData] = useState({ ...EMPTY_DEMOGRAPHICS })
  const [allergies, setAllergies] = useState([{ ...EMPTY_ALLERGY }])
  const [history, setHistory] = useState([{ ...EMPTY_HISTORY }])
  const [recommendations, setRecommendations] = useState([{ ...EMPTY_RECOMMENDATION }])
  const [medications, setMedications] = useState([{ ...EMPTY_MEDICATION }])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await patientAPI.getAll()
        const transformedPatients = response && response.length > 0
          ? response.map((p, index) => mapPatientFromAPI(p, index))
          : []

        setPatients(transformedPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()

    // Caregivers (Utilizatori cu ID_Rol = 5) for the assignment dropdown.
    if (canAddPatient) {
      patientAPI.getCaregivers()
        .then(setCaregivers)
        .catch(error => {
          console.error('Error fetching caregivers:', error)
          setCaregivers([])
        })
    }
  }, [])

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.room.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Generic helpers for the repeatable medical sections.
  const updateRow = (setter, index, field, value) =>
    setter(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  const addRow = (setter, empty) => setter(prev => [...prev, { ...empty }])
  const removeRow = (setter, index) =>
    setter(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))

  const resetForm = () => {
    setStep(1)
    setFormData({ ...EMPTY_DEMOGRAPHICS })
    setAllergies([{ ...EMPTY_ALLERGY }])
    setHistory([{ ...EMPTY_HISTORY }])
    setRecommendations([{ ...EMPTY_RECOMMENDATION }])
    setMedications([{ ...EMPTY_MEDICATION }])
  }

  const closeDialog = () => {
    setShowDialog(false)
    resetForm()
  }

  const validateDemographics = () => {
    if (!formData.lastName.trim() || !formData.firstName.trim() || !formData.cnp.trim()) {
      alert('Vă rugăm completați câmpurile obligatorii: Nume, Prenume, CNP')
      return false
    }
    if (!isValidCNP(formData.cnp.trim())) {
      alert('CNP invalid. Verificați cele 13 cifre și cifra de control.')
      return false
    }
    return true
  }

  const goToStep2 = () => {
    if (validateDemographics()) setStep(2)
  }

  // Save with demographics only — the medical step is optional.
  const handleSaveFromStep1 = () => {
    if (validateDemographics()) handleAddPatient()
  }

  const handleAddPatient = async () => {
    setSubmitting(true)
    try {
      const t = (v) => (v ? v.trim() : '')
      const orNull = (v) => (t(v) ? t(v) : null)

      const payload = {
        lastName: t(formData.lastName),
        firstName: t(formData.firstName),
        cnp: t(formData.cnp),
        street: t(formData.street),
        city: t(formData.city),
        county: t(formData.county),
        postalCode: t(formData.postalCode),
        phone: t(formData.phone),
        email: t(formData.email),
        profession: t(formData.profession),
        workPlace: t(formData.workplace),
        caregiverId: formData.caregiverId ? Number(formData.caregiverId) : null,
        allergies: allergies
          .filter(a => t(a.denumire))
          .map(a => ({ denumire: t(a.denumire) })),
        medicalHistory: history
          .filter(h => t(h.diagnostic))
          .map(h => ({
            diagnostic: t(h.diagnostic),
            tratament: orNull(h.tratament),
            dataDiagnostic: h.dataDiagnostic || null,
            observatii: orNull(h.observatii),
          })),
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

      const response = await patientAPI.create(payload)
      const newPatient = mapPatientFromAPI(response)

      setPatients(prev => [...prev, newPatient])
      closeDialog()
    } catch (error) {
      console.error('Error creating patient:', error)
      alert('Eroare la crearea pacientului')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-slate-800" style={{ fontSize: '32px' }}>Lista Pacienților</h1>
        </div>
        {canAddPatient && (
          <button
            onClick={() => { resetForm(); setShowDialog(true) }}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0f4c81' }}
          >
            <Plus size={18} />
            Adaugă Pacient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-5 py-3 w-full max-w-xs">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          className="bg-transparent text-slate-700 placeholder-slate-400 outline-none w-full"
          placeholder="Căutați după nume"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#0f4c81' }}>
                {['ID', '', 'Nume', 'CNP', 'Vârstă', 'Telefon', 'Oras', 'Acțiune'].map((h, i) => {
                  const isLeftAligned = [2, 3, 5, 6].includes(i)
                  const paddingClass = i === 0 ? 'px-5' : i === 1 ? 'px-3' : i === 2 ? 'px-2' : i === 3 ? 'px-2' : i === 7 ? 'px-3' : 'px-5'
                  return (
                  <th
                    key={i}
                    className={`${paddingClass} py-3 font-semibold text-white uppercase tracking-wide ${isLeftAligned ? 'text-left' : 'text-center'}`}
                    style={{
                      fontSize: '18px',
                      width: i === 0 ? '40px' : i === 1 ? '50px' : i === 3 ? '80px' : i === 5 ? '220px' : i === 6 ? '160px' : i === 7 ? '100px' : 'auto'
                    }}
                  >
                    {h}
                  </th>
                )})}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-600 text-center" style={{ fontSize: '18px' }}>#{p.patientId}</td>
                    <td className="px-3 py-3 flex justify-center">
                      <Avatar name={p.name} size="lg" />
                    </td>
                    <td className="px-2 py-3 text-left">
                      <button
                        className="font-semibold hover:underline cursor-pointer whitespace-nowrap"
                        style={{ color: '#0f4c81', fontSize: '18px' }}
                        onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-slate-600 text-left" style={{ fontSize: '18px' }}>{p.cnp || '-'}</td>
                    <td className="px-5 py-3 text-slate-600 text-center" style={{ fontSize: '18px' }}>{p.age}</td>
                    <td className="px-5 py-3 text-slate-600 text-left max-w-xs" style={{ fontSize: '18px' }}>
                      <span className="truncate block">{p.phone || '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-left max-w-xs" style={{ fontSize: '18px' }}>
                      <span className="truncate block">{p.city || '-'}</span>
                    </td>
                    <td className="px-3 py-3 flex justify-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                        className="font-semibold px-8 py-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#0f4c81', fontSize: '16px' }}
                      >
                        Fisa
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Nu există pacienți care să se potrivească cu filtrele actuale.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={showDialog}
        onClose={closeDialog}
        title={step === 1 ? 'Adaugă Pacient · Date demografice' : 'Adaugă Pacient · Date medicale'}
        maxWidth="max-w-3xl"
      >
        <DialogBody className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'text-white' : 'text-slate-500 bg-slate-100'}`} style={step === 1 ? { backgroundColor: '#0f4c81' } : {}}>1 · Date demografice</span>
            <span className="text-slate-300">→</span>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'text-white' : 'text-slate-500 bg-slate-100'}`} style={step === 2 ? { backgroundColor: '#0f4c81' } : {}}>2 · Date medicale</span>
          </div>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nume *" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Ex: Popescu" />
              <Field label="Prenume *" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ex: Ion" />
              <Field label="CNP *" name="cnp" value={formData.cnp} onChange={handleInputChange} placeholder="13 cifre" />
              <Field label="Telefon" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Ex: 0712 345 678" />
              <Field label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Ex: pacient@mail.com" />
              <Field label="Profesie" name="profession" value={formData.profession} onChange={handleInputChange} placeholder="Ex: Inginer" />
              <Field label="Loc de muncă" name="workplace" value={formData.workplace} onChange={handleInputChange} placeholder="Ex: SC Exemplu SRL" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Îngrijitor</label>
                <select
                  name="caregiverId"
                  value={formData.caregiverId}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="">— Fără îngrijitor —</option>
                  {caregivers.map(c => {
                    const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email
                    return <option key={c.userId} value={c.userId}>{name}</option>
                  })}
                </select>
              </div>
              <div className="col-span-2 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Adresă</div>
              <Field label="Stradă" name="street" value={formData.street} onChange={handleInputChange} placeholder="Ex: Str. Florilor nr. 10" />
              <Field label="Oraș" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ex: Cluj-Napoca" />
              <Field label="Județ" name="county" value={formData.county} onChange={handleInputChange} placeholder="Ex: Cluj" />
              <Field label="Cod poștal" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="Ex: 400001" />
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

              {/* Istoric medical */}
              <RepeatSection
                title="Istoric medical (diagnostice și tratamente)"
                rows={history}
                onAdd={() => addRow(setHistory, EMPTY_HISTORY)}
                onRemove={(i) => removeRow(setHistory, i)}
                renderRow={(row, i) => (
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Diagnostic *" value={row.diagnostic}
                      onChange={e => updateRow(setHistory, i, 'diagnostic', e.target.value)} />
                    <input className={inputClass} placeholder="Tratament" value={row.tratament}
                      onChange={e => updateRow(setHistory, i, 'tratament', e.target.value)} />
                    <input className={inputClass} type="date" value={row.dataDiagnostic}
                      onChange={e => updateRow(setHistory, i, 'dataDiagnostic', e.target.value)} />
                    <input className={inputClass} placeholder="Observații" value={row.observatii}
                      onChange={e => updateRow(setHistory, i, 'observatii', e.target.value)} />
                  </div>
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
                Vârsta este calculată automat din CNP. Câmpurile marcate cu * sunt obligatorii pentru a salva rândul.
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {step === 1 ? (
            <>
              <button onClick={closeDialog} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                Anulează
              </button>
              <button onClick={handleSaveFromStep1} disabled={submitting} className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-60" style={{ color: '#0f4c81', borderColor: '#0f4c81' }}>
                {submitting ? 'Se salvează...' : 'Salvează fără date medicale'}
              </button>
              <button onClick={goToStep2} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer" style={{ backgroundColor: '#0f4c81' }}>
                Continuă →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                ← Înapoi
              </button>
              <button onClick={handleAddPatient} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60" style={{ backgroundColor: '#0f4c81' }}>
                {submitting ? 'Se salvează...' : 'Adaugă Pacient'}
              </button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}
