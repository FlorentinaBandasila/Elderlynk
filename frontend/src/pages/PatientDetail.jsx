import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Heart, Wind, Thermometer, Activity, Stethoscope, User, ClipboardList, Plus, Pencil, Trash2
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { patientAPI, consultationAPI, deviceAPI, medicalRecommendationAPI } from '@/services/api'
import { mapPatientFromAPI, mapConsultationFromAPI, mapDeviceFromAPI } from '@/services/mappers'
import { useAuth, ROLES } from '@/context/AuthContext'

const consultVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

// Translate audit action codes into readable Romanian activity labels.
const ACTION_LABELS = {
  CREATE_PATIENT: 'a creat pacientul',
  REGISTER_PATIENT: 'a înregistrat pacientul',
  UPDATE_PATIENT: 'a modificat datele pacientului',
  DELETE_PATIENT: 'a șters pacientul',
  CREATE_ALLERGY: 'a adăugat o alergie',
  UPDATE_ALLERGY: 'a modificat o alergie',
  DELETE_ALLERGY: 'a șters o alergie',
  CREATE_HISTORY: 'a adăugat istoric medical',
  UPDATE_HISTORY: 'a modificat istoricul medical',
  DELETE_HISTORY: 'a șters din istoricul medical',
  CREATE_RECOMMENDATION: 'a adăugat o recomandare',
  UPDATE_RECOMMENDATION: 'a modificat o recomandare',
  DELETE_RECOMMENDATION: 'a șters o recomandare',
  CREATE_MEDICATION: 'a adăugat o schemă de medicație',
  UPDATE_MEDICATION: 'a modificat o schemă de medicație',
  DELETE_MEDICATION: 'a șters o schemă de medicație',
}

const formatActivity = (a) => {
  const who = a.userName || 'Un utilizator'
  const what = ACTION_LABELS[a.action] || (a.action ? a.action.toLowerCase().replace(/_/g, ' ') : 'a făcut o modificare')
  return `${who} ${what}`
}

const activityIconColor = {
  User: '#64748b', Pencil: '#0f4c81', Bell: '#e63946',
  Stethoscope: '#0891b2', Activity: '#d97706', Settings2: '#94a3b8',
}

export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const patientId = parseInt(id.replace('p', ''))
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [devices, setDevices] = useState([])
  const [medicalRecommendations, setMedicalRecommendations] = useState([])
  const [allergies, setAllergies] = useState([])
  const [history, setHistory] = useState([])
  const [medications, setMedications] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRecDialog, setShowRecDialog] = useState(false)
  const [recForm, setRecForm] = useState({ tipRecomandare: '', descriere: '' })
  const [savingRec, setSavingRec] = useState(false)
  const [editTarget, setEditTarget] = useState(null) // { type, id, form, title }
  const [savingEdit, setSavingEdit] = useState(false)
  const effectRan = useRef(false)
  const { hasRole } = useAuth()
  const canEdit = hasRole(ROLES.ADMIN) || hasRole(ROLES.MEDIC)

  // ===== Loaders (reusable so we can refresh after edits/deletes) =====
  const loadPatient = async () => {
    const r = await patientAPI.getById(patientId)
    setPatient(mapPatientFromAPI(r))
  }
  const loadConsultations = async () => {
    try {
      const res = await consultationAPI.getAll()
      setConsultations(res.filter(c => c.patientId === patientId).map(mapConsultationFromAPI))
    } catch { setConsultations([]) }
  }
  const loadRecommendations = async () => {
    try {
      const r = await medicalRecommendationAPI.getByPatientId(patientId)
      setMedicalRecommendations(Array.isArray(r) ? r : [])
    } catch { setMedicalRecommendations([]) }
  }
  const loadMedical = async () => {
    const [a, h, m] = await Promise.all([
      patientAPI.getAllergies(patientId).catch(() => []),
      patientAPI.getHistory(patientId).catch(() => []),
      patientAPI.getMedications(patientId).catch(() => []),
    ])
    setAllergies(Array.isArray(a) ? a : [])
    setHistory(Array.isArray(h) ? h : [])
    setMedications(Array.isArray(m) ? m : [])
  }
  const loadActivity = async () => {
    try {
      const r = await patientAPI.getActivity(patientId)
      setActivity(Array.isArray(r) ? r : [])
    } catch { setActivity([]) }
  }

  const handleAddRecommendation = async () => {
    if (!recForm.descriere.trim()) {
      alert('Descrierea recomandării este obligatorie.')
      return
    }
    setSavingRec(true)
    try {
      await medicalRecommendationAPI.create({
        patientId,
        tipRecomandare: recForm.tipRecomandare.trim() || null,
        descriere: recForm.descriere.trim(),
      })
      await Promise.all([loadRecommendations(), loadActivity()])
      setShowRecDialog(false)
      setRecForm({ tipRecomandare: '', descriere: '' })
    } catch (err) {
      console.error('Error creating recommendation:', err)
      alert('Eroare la adăugarea recomandării.')
    } finally {
      setSavingRec(false)
    }
  }

  // ===== Edit / delete dispatch =====
  const closeEdit = () => setEditTarget(null)

  const saveEdit = async () => {
    if (!editTarget) return
    const { type, id: itemId, form } = editTarget
    setSavingEdit(true)
    try {
      if (type === 'patient') {
        await patientAPI.update(patientId, form)
        await Promise.all([loadPatient(), loadActivity()])
      } else if (type === 'allergy') {
        if (!form.denumire.trim()) { alert('Denumirea este obligatorie.'); setSavingEdit(false); return }
        await patientAPI.updateAllergy(itemId, { denumire: form.denumire.trim() })
        await Promise.all([loadMedical(), loadActivity()])
      } else if (type === 'history') {
        if (!form.diagnostic.trim()) { alert('Diagnosticul este obligatoriu.'); setSavingEdit(false); return }
        await patientAPI.updateHistory(itemId, {
          diagnostic: form.diagnostic.trim(),
          tratament: form.tratament.trim() || null,
          dataDiagnostic: form.dataDiagnostic || null,
          observatii: form.observatii.trim() || null,
        })
        await Promise.all([loadMedical(), loadActivity()])
      } else if (type === 'medication') {
        if (!form.denumireMedicament.trim() || !form.doza.trim()) { alert('Denumirea și doza sunt obligatorii.'); setSavingEdit(false); return }
        await patientAPI.updateMedication(itemId, {
          denumireMedicament: form.denumireMedicament.trim(),
          doza: form.doza.trim(),
          frecventaAdministrare: form.frecventaAdministrare.trim() || null,
          durataTratament: form.durataTratament.trim() || null,
          observatiiIngrijitor: form.observatiiIngrijitor.trim() || null,
        })
        await Promise.all([loadMedical(), loadActivity()])
      } else if (type === 'recommendation') {
        if (!form.descriere.trim()) { alert('Descrierea este obligatorie.'); setSavingEdit(false); return }
        await medicalRecommendationAPI.update(itemId, {
          tipRecomandare: form.tipRecomandare.trim() || null,
          descriere: form.descriere.trim(),
        })
        await Promise.all([loadRecommendations(), loadActivity()])
      }
      closeEdit()
    } catch (err) {
      console.error('Error saving edit:', err)
      alert('Eroare la salvarea modificărilor.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (type, itemId, label) => {
    if (!window.confirm(`Sigur doriți să ștergeți ${label}?`)) return
    try {
      if (type === 'allergy') { await patientAPI.deleteAllergy(itemId); await Promise.all([loadMedical(), loadActivity()]) }
      else if (type === 'history') { await patientAPI.deleteHistory(itemId); await Promise.all([loadMedical(), loadActivity()]) }
      else if (type === 'medication') { await patientAPI.deleteMedication(itemId); await Promise.all([loadMedical(), loadActivity()]) }
      else if (type === 'recommendation') { await medicalRecommendationAPI.delete(itemId); await Promise.all([loadRecommendations(), loadActivity()]) }
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Eroare la ștergere.')
    }
  }

  const handleDeletePatient = async () => {
    if (!window.confirm('Sigur doriți să ștergeți acest pacient? Pacientul va fi dezactivat.')) return
    try {
      await patientAPI.delete(patientId)
      navigate('/patients')
    } catch (err) {
      console.error('Error deleting patient:', err)
      alert('Eroare la ștergerea pacientului.')
    }
  }

  // Open prefilled edit dialogs
  const editPatient = () => setEditTarget({ type: 'patient', id: patientId, title: 'Editează Date Pacient', form: {
    lastName: patient.lastName || '', firstName: patient.firstName || '', cnp: patient.cnp || '',
    street: patient.street || '', city: patient.city || '', county: patient.county || '', postalCode: patient.postalCode || '',
    phone: patient.phone || '', email: patient.email || '', profession: patient.profession || '', workPlace: patient.workplace || '',
  } })
  const editAllergy = (a) => setEditTarget({ type: 'allergy', id: a.allergyId, title: 'Editează Alergie', form: { denumire: a.denumire || '' } })
  const editHistory = (h) => setEditTarget({ type: 'history', id: h.historyId, title: 'Editează Istoric Medical', form: {
    diagnostic: h.diagnostic || '', tratament: h.tratament || '', dataDiagnostic: h.dataDiagnostic ? h.dataDiagnostic.split('T')[0] : '', observatii: h.observatii || '',
  } })
  const editMedication = (m) => setEditTarget({ type: 'medication', id: m.medicationId, title: 'Editează Schemă Medicație', form: {
    denumireMedicament: m.denumireMedicament || '', doza: m.doza || '', frecventaAdministrare: m.frecventaAdministrare || '', durataTratament: m.durataTratament || '', observatiiIngrijitor: m.observatiiIngrijitor || '',
  } })
  const editRecommendation = (r) => setEditTarget({ type: 'recommendation', id: r.recommendationId, title: 'Editează Recomandare', form: { tipRecomandare: r.tipRecomandare || '', descriere: r.descriere || '' } })
  const setEditForm = (field, value) => setEditTarget(t => ({ ...t, form: { ...t.form, [field]: value } }))

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true

    const fetchData = async () => {
      try {
        setLoading(true)
        await loadPatient()
        await Promise.all([
          loadConsultations(),
          loadRecommendations(),
          loadMedical(),
          loadActivity(),
          (async () => {
            try {
              const devicesResponse = await deviceAPI.getAll()
              setDevices(devicesResponse.filter(d => d.patientId === patientId).map(mapDeviceFromAPI))
            } catch { setDevices([]) }
          })(),
        ])
      } catch (err) {
        console.error('Error fetching patient:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return (
    <div className="p-10 text-center text-slate-500">Se încarcă...</div>
  )

  if (!patient) return (
    <div className="p-10 text-center text-slate-500">Pacientul nu a fost găsit.</div>
  )


  const diagnosisList = history.map(h => h.diagnostic).filter(Boolean)
  const allergyList = allergies.map(a => a.denumire).filter(Boolean)

  // Owning medic = the doctor on the patient's consultations.
  const physicianName =
    consultations.map(c => c.doctorName || c.physician).find(Boolean) ||
    patient.physician ||
    'Necunoscut'

  const vitals = patient.vitals ? [
    {
      label: 'Ritm Cardiac',       value: patient.vitals.hr,   unit: 'bpm',  icon: Heart,       color: '#e63946',
      warn: patient.vitals.hr > 100 || patient.vitals.hr < 55,
    },
    {
      label: 'SpO₂',             value: patient.vitals.spo2, unit: '%',    icon: Wind,        color: '#00b4d8',
      warn: patient.vitals.spo2 < 92,
    },
    {
      label: 'PA Sistolică',      value: patient.vitals.bp,   unit: 'mmHg', icon: Activity,    color: '#7c3aed',
      warn: false,
    },
    {
      label: 'Temperatură',      value: patient.vitals.temp, unit: '°C',   icon: Thermometer, color: '#d97706',
      warn: patient.vitals.temp > 38,
    },
  ] : []

  return (
    <div className="p-6 space-y-5">

      {/* Titlu */}
      <h1 className="text-2xl font-bold text-slate-800">Vedere Generală Pacient</h1>

      {/* Card antet */}
      <Card>
        <CardBody className="py-5">
          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}
            >
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: '#0f4c81' }}
                  >
                    {patient.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                    <span>ID: {patient.id.replace('p', '').padStart(6, '0')}</span>
                    <span>·</span>
                    <span>{patient.age} ani, {patient.gender}</span>
                    <span>·</span>
                    <span>{patient.room}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Stethoscope size={13} style={{ color: '#0f4c81' }} />
                      <span style={{ color: '#0f4c81' }}>{physicianName}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <>
                      <button
                        onClick={editPatient}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Pencil size={13} /> Editează
                      </button>
                      <button
                        onClick={handleDeletePatient}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Șterge
                      </button>
                    </>
                  )}
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-2"
                    style={{
                      color: '#16a34a',
                      borderColor: '#16a34a',
                      backgroundColor: '#f0fdf4',
                    }}
                  >
                    {patient.status === 'Admitted' ? 'Stabil' : 'Ambulator'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Diagnostic Principal
                  </div>
                  <div className="text-slate-700 font-medium">{diagnosisList[0] || 'Niciun diagnostic'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Secundar
                  </div>
                  <div className="text-slate-500 text-sm">
                    {diagnosisList.slice(1).join(', ') || 'Niciunu'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Alergii
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: allergyList.length > 0 ? '#e63946' : '#94a3b8' }}
                  >
                    {allergyList.length > 0 ? allergyList.join(', ') : 'Niciuna cunoscută'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Stânga: semne vitale + tendințe + senzori + consultații */}
        <div className="lg:col-span-2 space-y-5">

          {/* Semne Vitale Actuale */}
          {vitals.length > 0 && (
            <div>
              <h3
                className="text-base font-bold mb-3"
                style={{ color: '#0f4c81' }}
              >
                Măsurători Vitale Actuale
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {vitals.map(v => {
                  const Icon = v.icon
                  return (
                    <Card
                      key={v.label}
                      style={v.warn ? { borderColor: '#fca5a5' } : {}}
                    >
                      <CardBody className="py-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon size={16} style={{ color: v.warn ? '#e63946' : v.color }} />
                          <span
                            className="text-sm font-medium"
                            style={{ color: v.warn ? '#e63946' : '#64748b' }}
                          >
                            {v.label}
                          </span>
                        </div>
                        <div className={`font-bold leading-none ${v.warn ? 'text-red-600' : 'text-slate-800'}`}
                          style={{ fontSize: '3rem' }}
                        >
                          {v.value}
                          <span className="text-lg font-normal text-slate-400 ml-2">{v.unit}</span>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tendințe 24h */}
          <Card>
            <CardBody className="py-5">
              <h3 className="text-base font-bold text-slate-700 mb-4">Tendințe Vitale 24h</h3>
              <div
                className="flex items-center justify-center rounded-lg text-sm text-slate-400"
                style={{ height: '120px', backgroundColor: '#f8fafc' }}
              >
                Niciun istoric disponibil.
              </div>
            </CardBody>
          </Card>

          {/* Senzori */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Citiri Senzori</h3>
              <div className="space-y-3">
                {devices.length === 0 && (
                  <p className="text-sm text-slate-400">Niciun senzor atribuit.</p>
                )}
                {devices.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{s.model}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.bluetoothMacAddress}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={s.status === 'Online' ? 'green' : s.status === 'Offline' ? 'red' : 'gray'}>
                        {s.status}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">{s.battery}% baterie</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Istoric Consultații */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Istoric Consultații</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Tip', 'Data', 'Medic', 'Status'].map(h => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                          Nicio consultație înregistrată.
                        </td>
                      </tr>
                    )}
                    {consultations.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-700 text-sm">{c.type}</td>
                        <td className="py-3 pr-4 text-slate-500 text-sm">{c.date} {c.time}</td>
                        <td className="py-3 pr-4 text-slate-500 text-sm">{c.doctorName || c.physician || 'Necunoscut'}</td>
                        <td className="py-3">
                          <Badge variant={consultVariant[c.status] || 'gray'}>{c.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Alergii */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Alergii</h3>
              <div className="space-y-2">
                {allergies.length === 0 && (
                  <p className="text-sm text-slate-400">Nicio alergie înregistrată.</p>
                )}
                {allergies.map(a => (
                  <div key={a.allergyId} className="flex items-center justify-between gap-2 p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="text-sm font-medium" style={{ color: '#e63946' }}>{a.denumire}</div>
                    <RowActions canEdit={canEdit} onEdit={() => editAllergy(a)} onDelete={() => handleDelete('allergy', a.allergyId, `alergia "${a.denumire}"`)} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Istoric Medical */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Istoric Medical</h3>
              <div className="space-y-3">
                {history.length === 0 && (
                  <p className="text-sm text-slate-400">Niciun istoric medical înregistrat.</p>
                )}
                {history.map(h => (
                  <div key={h.historyId} className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-700">{h.diagnostic}</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {h.dataDiagnostic && (
                          <span className="text-xs text-slate-400">
                            {new Date(h.dataDiagnostic).toLocaleDateString('ro-RO')}
                          </span>
                        )}
                        <RowActions canEdit={canEdit} onEdit={() => editHistory(h)} onDelete={() => handleDelete('history', h.historyId, 'acest istoric medical')} />
                      </div>
                    </div>
                    {h.tratament && (
                      <div className="text-xs text-slate-500 mt-1"><span className="font-medium">Tratament:</span> {h.tratament}</div>
                    )}
                    {h.observatii && (
                      <div className="text-xs text-slate-400 mt-0.5">{h.observatii}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Scheme de Medicație */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Scheme de Medicație</h3>
              <div className="space-y-3">
                {medications.length === 0 && (
                  <p className="text-sm text-slate-400">Nicio schemă de medicație înregistrată.</p>
                )}
                {medications.map(m => (
                  <div key={m.medicationId} className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-700">
                        {m.denumireMedicament} <span className="text-slate-500 font-normal">· {m.doza}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.dataPrescriere && (
                          <span className="text-xs text-slate-400">
                            {new Date(m.dataPrescriere).toLocaleDateString('ro-RO')}
                          </span>
                        )}
                        <RowActions canEdit={canEdit} onEdit={() => editMedication(m)} onDelete={() => handleDelete('medication', m.medicationId, 'această schemă de medicație')} />
                      </div>
                    </div>
                    {(m.frecventaAdministrare || m.durataTratament) && (
                      <div className="text-xs text-slate-500 mt-1">
                        {[m.frecventaAdministrare, m.durataTratament].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    {m.observatiiIngrijitor && (
                      <div className="text-xs text-slate-400 mt-0.5">{m.observatiiIngrijitor}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Dreapta: Activitate Recentă + Recomandări */}
        <div className="space-y-5">

          {/* Activitate Recentă */}
          <div>
            <h3
              className="text-base font-bold mb-3"
              style={{ color: '#0f4c81' }}
            >
              Activitate Recentă
            </h3>
            <Card>
              <CardBody className="py-3 divide-y divide-slate-50">
                {activity.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Nicio activitate înregistrată.</p>
                ) : (
                  activity.slice(0, 12).map((a) => (
                    <div key={a.logId} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#f1f5f9' }}
                      >
                        <Activity size={14} style={{ color: '#0f4c81' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium text-slate-700 leading-snug">{formatActivity(a)}</div>
                          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                            {a.logDateTime ? new Date(a.logDateTime).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        {a.details && (
                          <div className="text-xs text-slate-500 mt-0.5 break-words">{a.details}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>

          {/* Recomandări */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold" style={{ color: '#0f4c81' }}>
                Recomandări
              </h3>
              {canEdit && (
                <button
                  onClick={() => setShowRecDialog(true)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#0f4c81' }}
                >
                  <Plus size={14} /> Adaugă
                </button>
              )}
            </div>
            <Card>
              <CardBody className="py-3 divide-y divide-slate-50">
                {medicalRecommendations.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Nicio recomandare înregistrată.</p>
                ) : (
                  medicalRecommendations.map((r, i) => (
                    <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#f1f5f9' }}
                      >
                        <ClipboardList size={14} style={{ color: '#16a34a' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-700 leading-tight">
                            {r.tipRecomandare || 'Recomandare'}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400 mt-0.5">
                              {r.dataRecomandarii
                                ? new Date(r.dataRecomandarii).toLocaleDateString('ro-RO')
                                : ''}
                            </span>
                            <RowActions canEdit={canEdit} onEdit={() => editRecommendation(r)} onDelete={() => handleDelete('recommendation', r.recommendationId, 'această recomandare')} />
                          </div>
                        </div>
                        {r.descriere && (
                          <div className="text-xs text-slate-500 mt-0.5">{r.descriere}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>

        </div>
      </div>

      <Dialog open={showRecDialog} onClose={() => setShowRecDialog(false)} title="Adaugă Recomandare">
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tip recomandare</label>
            <input
              type="text"
              value={recForm.tipRecomandare}
              onChange={e => setRecForm(f => ({ ...f, tipRecomandare: e.target.value }))}
              placeholder="Ex: Regim alimentar"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descriere *</label>
            <textarea
              rows={3}
              value={recForm.descriere}
              onChange={e => setRecForm(f => ({ ...f, descriere: e.target.value }))}
              placeholder="Detaliile recomandării..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <button
            onClick={() => setShowRecDialog(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Anulează
          </button>
          <button
            onClick={handleAddRecommendation}
            disabled={savingRec}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#0f4c81' }}
          >
            {savingRec ? 'Se salvează...' : 'Adaugă'}
          </button>
        </DialogFooter>
      </Dialog>

      {/* Generic edit dialog */}
      <Dialog
        open={!!editTarget}
        onClose={closeEdit}
        title={editTarget?.title || 'Editează'}
        maxWidth={editTarget?.type === 'patient' ? 'max-w-2xl' : 'max-w-lg'}
      >
        {editTarget && (
          <>
            <DialogBody className="space-y-4">
              {editTarget.type === 'patient' && (
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Nume" value={editTarget.form.lastName} onChange={v => setEditForm('lastName', v)} />
                  <EditField label="Prenume" value={editTarget.form.firstName} onChange={v => setEditForm('firstName', v)} />
                  <EditField label="CNP" value={editTarget.form.cnp} onChange={v => setEditForm('cnp', v)} />
                  <EditField label="Telefon" value={editTarget.form.phone} onChange={v => setEditForm('phone', v)} />
                  <EditField label="Email" value={editTarget.form.email} onChange={v => setEditForm('email', v)} />
                  <EditField label="Profesie" value={editTarget.form.profession} onChange={v => setEditForm('profession', v)} />
                  <EditField label="Loc de muncă" value={editTarget.form.workPlace} onChange={v => setEditForm('workPlace', v)} />
                  <EditField label="Stradă" value={editTarget.form.street} onChange={v => setEditForm('street', v)} />
                  <EditField label="Oraș" value={editTarget.form.city} onChange={v => setEditForm('city', v)} />
                  <EditField label="Județ" value={editTarget.form.county} onChange={v => setEditForm('county', v)} />
                  <EditField label="Cod poștal" value={editTarget.form.postalCode} onChange={v => setEditForm('postalCode', v)} />
                </div>
              )}
              {editTarget.type === 'allergy' && (
                <EditField label="Denumire *" value={editTarget.form.denumire} onChange={v => setEditForm('denumire', v)} />
              )}
              {editTarget.type === 'history' && (
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Diagnostic *" value={editTarget.form.diagnostic} onChange={v => setEditForm('diagnostic', v)} />
                  <EditField label="Tratament" value={editTarget.form.tratament} onChange={v => setEditForm('tratament', v)} />
                  <EditField label="Data diagnostic" type="date" value={editTarget.form.dataDiagnostic} onChange={v => setEditForm('dataDiagnostic', v)} />
                  <EditField label="Observații" value={editTarget.form.observatii} onChange={v => setEditForm('observatii', v)} />
                </div>
              )}
              {editTarget.type === 'medication' && (
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Denumire medicament *" value={editTarget.form.denumireMedicament} onChange={v => setEditForm('denumireMedicament', v)} />
                  <EditField label="Doză *" value={editTarget.form.doza} onChange={v => setEditForm('doza', v)} />
                  <EditField label="Frecvență administrare" value={editTarget.form.frecventaAdministrare} onChange={v => setEditForm('frecventaAdministrare', v)} />
                  <EditField label="Durată tratament" value={editTarget.form.durataTratament} onChange={v => setEditForm('durataTratament', v)} />
                  <div className="col-span-2">
                    <EditField label="Observații îngrijitor" value={editTarget.form.observatiiIngrijitor} onChange={v => setEditForm('observatiiIngrijitor', v)} />
                  </div>
                </div>
              )}
              {editTarget.type === 'recommendation' && (
                <>
                  <EditField label="Tip recomandare" value={editTarget.form.tipRecomandare} onChange={v => setEditForm('tipRecomandare', v)} />
                  <EditField label="Descriere *" value={editTarget.form.descriere} onChange={v => setEditForm('descriere', v)} />
                </>
              )}
            </DialogBody>
            <DialogFooter>
              <button
                onClick={closeEdit}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: '#0f4c81' }}
              >
                {savingEdit ? 'Se salvează...' : 'Salvează'}
              </button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  )
}

function RowActions({ canEdit, onEdit, onDelete }) {
  if (!canEdit) return null
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button onClick={onEdit} className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Editează">
        <Pencil size={13} />
      </button>
      <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Șterge">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
