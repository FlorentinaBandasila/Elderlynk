import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Heart, Wind, Thermometer, Activity, Stethoscope, User, ClipboardList, Plus, Pencil, Trash2,
  Send, FileText, Inbox, ArrowUpRight, Download
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { TimeSeriesChart, CHART_COLORS } from '@/components/ui/Chart'
import { patientAPI, consultationAPI, deviceAPI, medicalRecommendationAPI, hl7MessageAPI } from '@/services/api'
import { mapPatientFromAPI, mapConsultationFromAPI, mapDeviceFromAPI, groupMeasurementsBySensor } from '@/services/mappers'
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

// ===== HL7 v2.x export helpers =====
// Build a downloadable, pipe-delimited HL7 v2.5 referral (REF^I12) carrying the
// patient demographics, ICD-9 diagnosis and the latest monitored parameters.

// Derive birth date (YYYYMMDD) and sex (M/F/U) from a Romanian CNP.
const parseCNP = (cnp) => {
  if (!cnp || cnp.length !== 13) return { dob: '', sex: 'U' }
  const s = cnp[0]
  const century = { 1: '19', 2: '19', 3: '18', 4: '18', 5: '20', 6: '20', 7: '19', 8: '19', 9: '19' }[s] || '19'
  const sex = '13579'.includes(s) ? 'M' : '2468'.includes(s) ? 'F' : 'U'
  return { dob: `${century}${cnp.substring(1, 3)}${cnp.substring(3, 5)}${cnp.substring(5, 7)}`, sex }
}

const hl7Timestamp = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

// Escape the HL7 delimiter characters so field values stay well-formed.
const hl7Escape = (s) => String(s ?? '')
  .replace(/\\/g, '\\E\\').replace(/\|/g, '\\F\\').replace(/\^/g, '\\S\\')
  .replace(/&/g, '\\T\\').replace(/~/g, '\\R\\').replace(/[\r\n]+/g, ' ')

// Recover specialty / reason / clinical info from a stored referral XML envelope.
const parseReferralXml = (content) => {
  try {
    const doc = new DOMParser().parseFromString(content || '', 'application/xml')
    const rf1 = doc.querySelector('RF1')
    const obx = doc.querySelector('OBX')
    return {
      specialty: rf1?.getAttribute('specialty') || '',
      reason: rf1?.getAttribute('reason') || '',
      clinicalInfo: obx?.textContent?.trim() || '',
    }
  } catch {
    return { specialty: '', reason: '', clinicalInfo: '' }
  }
}

// Format an HL7 timestamp (YYYYMMDDHHMMSS) into a readable ro-RO date-time.
const formatHL7Ts = (ts) => {
  if (!ts) return ''
  const m = String(ts).match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/)
  if (!m) return ts
  const [, y, mo, d, h = '00', mi = '00'] = m
  const dt = new Date(`${y}-${mo}-${d}T${h}:${mi}:00`)
  return isNaN(dt) ? ts : dt.toLocaleString('ro-RO')
}

// Parse the Elderlynk XML-style HL7 envelope into structured sections for display.
// Returns null when the content isn't recognizable XML HL7 (caller falls back to raw).
const parseHL7Display = (content) => {
  if (!content || !content.includes('<HL7Message')) return null
  try {
    const doc = new DOMParser().parseFromString(content, 'application/xml')
    if (doc.querySelector('parsererror')) return null
    const root = doc.querySelector('HL7Message')
    const msh = doc.querySelector('MSH')
    const pid = doc.querySelector('PID')
    const rf1 = doc.querySelector('RF1')
    const obx = doc.querySelector('OBX')

    const name = pid?.getAttribute('name') || ''
    const [lastName, firstName] = name.split('^')

    return {
      type: root?.getAttribute('type') || '',
      header: {
        from: msh?.getAttribute('sendingApp') || '',
        to: msh?.getAttribute('receivingApp') || '',
        messageType: msh?.getAttribute('messageType') || '',
        controlId: msh?.getAttribute('controlId') || '',
        timestamp: formatHL7Ts(msh?.getAttribute('timestamp')),
        inResponseTo: msh?.getAttribute('inResponseTo') || '',
      },
      patient: pid ? {
        id: pid.getAttribute('id') || '',
        name: firstName ? `${firstName} ${lastName}` : (lastName || name),
        cnp: pid.getAttribute('cnp') || '',
      } : null,
      referral: rf1 ? {
        status: rf1.getAttribute('status') || '',
        specialty: rf1.getAttribute('specialty') || '',
        reason: rf1.getAttribute('reason') || '',
      } : null,
      body: obx ? {
        id: obx.getAttribute('id') || '',
        text: obx.textContent?.trim() || '',
      } : null,
    }
  } catch {
    return null
  }
}

const buildHL7v2 = ({ patient, consultations, sensorGroups, message }) => {
  const E = hl7Escape
  const ts = hl7Timestamp()
  const ref = parseReferralXml(message?.content)
  const { dob, sex } = parseCNP(patient?.cnp)
  const seg = []

  // MSH – message header
  seg.push(['MSH', '^~\\&', 'ELDERLYNK', 'CARELINK', 'SPECIALIST_SYS',
    ref.specialty ? E(ref.specialty) : 'SPECIALIST', ts, '', 'REF^I12^REF_I12',
    `MSG${ts}`, 'P', '2.5'].join('|'))

  // PID – patient demographics
  const idList = `${patient?.patientId ?? ''}^^^ELDERLYNK^MR~${E(patient?.cnp)}^^^ROU^NNROU`
  const name = `${E(patient?.lastName)}^${E(patient?.firstName)}`
  const addr = [E(patient?.street), '', E(patient?.city), E(patient?.county), E(patient?.postalCode), 'ROU'].join('^')
  seg.push(['PID', '1', '', idList, '', name, '', dob, sex, '', '', addr, '', E(patient?.phone)].join('|'))

  // PV1 – outpatient visit
  seg.push(['PV1', '1', 'O'].join('|'))

  // DG1 – ICD-9 diagnoses, newest consultations first
  const diagnosed = (consultations || [])
    .filter((c) => c.diagnosisCode)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  diagnosed.forEach((c, i) => {
    seg.push(['DG1', String(i + 1), 'I9', `${E(c.diagnosisCode)}^${E(c.diagnosticText)}^I9`,
      E(c.diagnosticText), (c.date || '').replace(/-/g, ''), 'F'].join('|'))
  })

  // OBX – latest value of every monitored parameter
  let obx = 0
  for (const [type, g] of Object.entries(sensorGroups || {})) {
    const latest = (g.data || []).filter((d) => d.value != null).sort((a, b) => b.ts - a.ts)[0]
    if (!latest) continue
    const range = g.thresholds?.lowWarn != null && g.thresholds?.highWarn != null
      ? `${g.thresholds.lowWarn}-${g.thresholds.highWarn}` : ''
    seg.push(['OBX', String(++obx), 'NM', `${E(type)}^${E(type)}`, '', String(latest.value),
      E(g.unit), range, '', '', '', 'F', '', E(latest.time)].join('|'))
  }

  // OBX – referral clinical free text
  if (ref.clinicalInfo) {
    seg.push(['OBX', String(++obx), 'TX', 'ClinicalInfo^Informatii clinice', '', E(ref.clinicalInfo), '', '', '', '', 'F'].join('|'))
  }

  // RF1 – referral information
  seg.push(['RF1', ref.specialty ? `^^^^${E(ref.specialty)}` : '', 'P', 'R', '', '', ts, '', E(ref.reason)].join('|'))

  return seg.join('\r') + '\r'
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
  const [sensorGroups, setSensorGroups] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRecDialog, setShowRecDialog] = useState(false)
  const [recForm, setRecForm] = useState({ tipRecomandare: '', descriere: '' })
  const [savingRec, setSavingRec] = useState(false)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [activityForm, setActivityForm] = useState({ activityType: 'Mers', dailyDurationMinutes: '', description: '', startDate: '', endDate: '' })
  const [savingActivity, setSavingActivity] = useState(false)
  const [hl7Messages, setHl7Messages] = useState([])
  const [showReferralDialog, setShowReferralDialog] = useState(false)
  const [referralForm, setReferralForm] = useState({ specialty: 'Cardiologie', reason: '', clinicalInfo: '' })
  const [savingReferral, setSavingReferral] = useState(false)
  const [viewMessage, setViewMessage] = useState(null)
  const [showRawHL7, setShowRawHL7] = useState(false)
  const [busyReplyId, setBusyReplyId] = useState(null)
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
  const loadHl7 = async () => {
    try {
      const r = await hl7MessageAPI.getByPatient(patientId)
      setHl7Messages(Array.isArray(r) ? r : [])
    } catch { setHl7Messages([]) }
  }

  const handleCreateReferral = async () => {
    if (!referralForm.reason.trim()) { alert('Motivul trimiterii este obligatoriu.'); return }
    setSavingReferral(true)
    try {
      await hl7MessageAPI.referral({
        patientId,
        specialty: referralForm.specialty.trim() || null,
        reason: referralForm.reason.trim(),
        clinicalInfo: referralForm.clinicalInfo.trim() || null,
      })
      await loadHl7()
      setShowReferralDialog(false)
      setReferralForm({ specialty: 'Cardiologie', reason: '', clinicalInfo: '' })
    } catch (err) {
      console.error('Error generating referral:', err)
      alert('Eroare la generarea trimiterii HL7.')
    } finally {
      setSavingReferral(false)
    }
  }

  const handleReceiveLetter = async (referralId) => {
    setBusyReplyId(referralId)
    try {
      await hl7MessageAPI.reply(referralId)
      await loadHl7()
    } catch (err) {
      console.error('Error receiving medical letter:', err)
      alert('Eroare la primirea scrisorii medicale.')
    } finally {
      setBusyReplyId(null)
    }
  }

  // Build an HL7 v2.x referral from the current patient record and download it as a .hl7 file.
  const handleExportHL7 = (message) => {
    const hl7 = buildHL7v2({ patient, consultations, sensorGroups, message })
    const blob = new Blob([hl7], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HL7_${(patient?.lastName || 'pacient')}_${message?.messageId ?? hl7Timestamp()}.hl7`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleAddActivityRec = async () => {
    if (!activityForm.activityType.trim()) { alert('Tipul activității este obligatoriu.'); return }
    setSavingActivity(true)
    try {
      // Activity recommendations are persisted in the existing Recomandari_Medicale table:
      // type carries the activity, description carries the daily duration + instructions.
      const parts = []
      if (activityForm.dailyDurationMinutes) parts.push(`${activityForm.dailyDurationMinutes} min/zi`)
      if (activityForm.description.trim()) parts.push(activityForm.description.trim())
      if (activityForm.startDate || activityForm.endDate)
        parts.push(`Perioadă: ${activityForm.startDate || '...'} → ${activityForm.endDate || '...'}`)

      await medicalRecommendationAPI.create({
        patientId,
        tipRecomandare: `Activitate fizică: ${activityForm.activityType.trim()}`,
        descriere: parts.join(' — '),
      })
      await Promise.all([loadRecommendations(), loadActivity()])
      setShowActivityDialog(false)
      setActivityForm({ activityType: 'Mers', dailyDurationMinutes: '', description: '', startDate: '', endDate: '' })
    } catch (err) {
      console.error('Error creating activity recommendation:', err)
      alert('Eroare la adăugarea recomandării de activitate.')
    } finally {
      setSavingActivity(false)
    }
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
          loadHl7(),
          loadMedical(),
          loadActivity(),
          (async () => {
            try {
              const devicesResponse = await deviceAPI.getAll()
              setDevices(devicesResponse.filter(d => d.patientId === patientId).map(mapDeviceFromAPI))
            } catch { setDevices([]) }
          })(),
          (async () => {
            try {
              const measurements = await patientAPI.getMeasurements(patientId)
              setSensorGroups(groupMeasurementsBySensor(measurements || []))
            } catch { setSensorGroups({}) }
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
                    {patient.caregiverName && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1" title="Îngrijitor">
                          <User size={13} style={{ color: '#0f4c81' }} />
                          <span style={{ color: '#0f4c81' }}>{patient.caregiverName}</span>
                        </span>
                      </>
                    )}
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

          {/* Evoluție senzori (grafice) */}
          <Card>
            <CardBody className="py-5">
              <h3 className="text-base font-bold text-slate-700 mb-4">Evoluție Senzori</h3>
              {Object.keys(sensorGroups).length === 0 ? (
                <div
                  className="flex items-center justify-center rounded-lg text-sm text-slate-400"
                  style={{ height: '120px', backgroundColor: '#f8fafc' }}
                >
                  Niciun istoric de măsurători disponibil.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(sensorGroups).map(([type, g]) => (
                    <div key={type}>
                      <div className="text-sm font-semibold text-slate-600 mb-1">
                        {type}{g.unit ? ` (${g.unit})` : ''}
                      </div>
                      <TimeSeriesChart
                        data={g.data}
                        series={[{ key: 'value', label: type, color: CHART_COLORS.primary }]}
                        unit={g.unit}
                        thresholds={g.thresholds}
                        height={200}
                        area
                      />
                    </div>
                  ))}
                </div>
              )}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowActivityDialog(true)}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: '#00b4d8' }}
                  >
                    <Activity size={14} /> Activitate
                  </button>
                  <button
                    onClick={() => setShowRecDialog(true)}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: '#0f4c81' }}
                  >
                    <Plus size={14} /> Adaugă
                  </button>
                </div>
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

          {/* Trimiteri Specialist (HL7) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold" style={{ color: '#0f4c81' }}>
                Trimiteri Specialist (HL7)
              </h3>
              {canEdit && (
                <button
                  onClick={() => setShowReferralDialog(true)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#0f4c81' }}
                >
                  <Send size={13} /> Trimitere
                </button>
              )}
            </div>
            <Card>
              <CardBody className="py-3 divide-y divide-slate-50">
                {hl7Messages.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Nicio trimitere HL7.</p>
                ) : (
                  hl7Messages.map((m) => {
                    const isOut = (m.direction || '').toUpperCase() === 'OUT'
                    const hasReply = !isOut || hl7Messages.some(o =>
                      (o.direction || '').toUpperCase() === 'IN' && new Date(o.transferDate) >= new Date(m.transferDate))
                    return (
                      <div key={m.messageId} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: isOut ? '#dbeafe' : '#dcfce7' }}>
                          {isOut ? <ArrowUpRight size={14} style={{ color: '#0f4c81' }} /> : <Inbox size={14} style={{ color: '#16a34a' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={isOut ? 'blue' : 'green'}>{isOut ? 'Trimitere' : 'Scrisoare medicală'}</Badge>
                            <span className="text-xs text-slate-400">
                              {m.transferDate ? new Date(m.transferDate).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <button onClick={() => setViewMessage(m)}
                              className="text-xs font-medium text-[#0f4c81] hover:underline flex items-center gap-1 cursor-pointer">
                              <FileText size={12} /> Vezi mesaj HL7
                            </button>
                            {isOut && (
                              <button onClick={() => handleExportHL7(m)}
                                className="text-xs font-medium text-amber-700 hover:underline flex items-center gap-1 cursor-pointer">
                                <Download size={12} /> Export HL7
                              </button>
                            )}
                            {canEdit && isOut && (
                              <button onClick={() => handleReceiveLetter(m.messageId)} disabled={busyReplyId === m.messageId}
                                className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50">
                                <Inbox size={12} /> {busyReplyId === m.messageId ? 'Se primește...' : 'Primește scrisoare'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardBody>
            </Card>
          </div>

        </div>
      </div>

      {/* Referral dialog */}
      <Dialog open={showReferralDialog} onClose={() => setShowReferralDialog(false)} title="Trimitere către specialist (HL7)">
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialitate</label>
            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={referralForm.specialty} onChange={e => setReferralForm(f => ({ ...f, specialty: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivul trimiterii</label>
            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={referralForm.reason} onChange={e => setReferralForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Informații clinice</label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={referralForm.clinicalInfo} onChange={e => setReferralForm(f => ({ ...f, clinicalInfo: e.target.value }))} />
          </div>
          <p className="text-xs text-slate-400">
            Se va genera un mesaj HL7 (REF^I12) către sistemul specialistului.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowReferralDialog(false)}>Anulează</Button>
          <Button onClick={handleCreateReferral} disabled={savingReferral}>
            <Send size={14} /> {savingReferral ? 'Se trimite...' : 'Generează trimiterea'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* HL7 message viewer */}
      <Dialog open={!!viewMessage} onClose={() => { setViewMessage(null); setShowRawHL7(false) }} title="Mesaj HL7" maxWidth="max-w-2xl">
        <DialogBody>
          {(() => {
            const isOut = (viewMessage?.direction || '').toUpperCase() === 'OUT'
            const parsed = parseHL7Display(viewMessage?.content)
            return (
              <>
                {/* Direction + transfer date banner */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${isOut ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isOut ? <ArrowUpRight size={18} /> : <Inbox size={18} />}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {isOut ? 'Trimitere către specialist' : 'Scrisoare medicală primită'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {viewMessage?.transferDate ? new Date(viewMessage.transferDate).toLocaleString('ro-RO') : ''}
                      </div>
                    </div>
                  </div>
                  <Badge variant={isOut ? 'blue' : 'green'}>{isOut ? 'OUT' : 'IN'}</Badge>
                </div>

                {parsed ? (
                  showRawHL7 ? (
                    <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-slate-700">
{viewMessage?.content || ''}
                    </pre>
                  ) : (
                    <div className="space-y-4">
                      {/* Routing / header */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                          <Send size={13} /> Antet mesaj
                        </div>
                        <div className="flex items-center justify-center gap-3 text-sm mb-3">
                          <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-medium text-slate-700">{parsed.header.from || '—'}</span>
                          <ArrowUpRight size={16} className="text-slate-400 rotate-45" />
                          <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-medium text-slate-700">{parsed.header.to || '—'}</span>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                          {parsed.header.messageType && (<><dt className="text-slate-400">Tip</dt><dd className="text-slate-700 text-right font-mono">{parsed.header.messageType}</dd></>)}
                          {parsed.header.timestamp && (<><dt className="text-slate-400">Dată/oră</dt><dd className="text-slate-700 text-right">{parsed.header.timestamp}</dd></>)}
                          {parsed.header.controlId && (<><dt className="text-slate-400">ID control</dt><dd className="text-slate-700 text-right font-mono">{parsed.header.controlId}</dd></>)}
                          {parsed.header.inResponseTo && (<><dt className="text-slate-400">Răspuns la</dt><dd className="text-slate-700 text-right font-mono">#{parsed.header.inResponseTo}</dd></>)}
                        </dl>
                      </div>

                      {/* Patient */}
                      {parsed.patient && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                            <User size={13} /> Pacient
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar name={parsed.patient.name} />
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{parsed.patient.name || '—'}</div>
                              <div className="text-xs text-slate-400 font-mono">CNP {parsed.patient.cnp || '—'}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Referral info */}
                      {parsed.referral && (parsed.referral.specialty || parsed.referral.reason || parsed.referral.status) && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                            <Stethoscope size={13} /> Trimitere
                          </div>
                          <dl className="grid grid-cols-1 gap-y-1.5 text-sm">
                            {parsed.referral.specialty && (<div className="flex justify-between gap-4"><dt className="text-slate-400">Specialitate</dt><dd className="text-slate-700 text-right">{parsed.referral.specialty}</dd></div>)}
                            {parsed.referral.reason && (<div className="flex justify-between gap-4"><dt className="text-slate-400">Motiv</dt><dd className="text-slate-700 text-right">{parsed.referral.reason}</dd></div>)}
                            {parsed.referral.status && (<div className="flex justify-between gap-4"><dt className="text-slate-400">Status</dt><dd className="text-slate-700 text-right">{parsed.referral.status}</dd></div>)}
                          </dl>
                        </div>
                      )}

                      {/* Clinical body */}
                      {parsed.body?.text && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            <FileText size={13} /> {parsed.body.id === 'MedicalLetter' ? 'Scrisoare medicală' : 'Informații clinice'}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{parsed.body.text}</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-slate-700">
{viewMessage?.content || ''}
                  </pre>
                )}
              </>
            )
          })()}
        </DialogBody>
        <DialogFooter>
          {parseHL7Display(viewMessage?.content) && (
            <Button variant="ghost" onClick={() => setShowRawHL7(v => !v)}>
              <FileText size={14} /> {showRawHL7 ? 'Vizualizare formatată' : 'Vezi sursa HL7'}
            </Button>
          )}
          {(viewMessage?.direction || '').toUpperCase() === 'OUT' && (
            <Button variant="ghost" onClick={() => handleExportHL7(viewMessage)}>
              <Download size={14} /> Export HL7
            </Button>
          )}
          <Button variant="ghost" onClick={() => { setViewMessage(null); setShowRawHL7(false) }}>Închide</Button>
        </DialogFooter>
      </Dialog>

      {/* Activity recommendation dialog */}
      <Dialog open={showActivityDialog} onClose={() => setShowActivityDialog(false)} title="Adaugă Recomandare Activitate">
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tip activitate</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={activityForm.activityType}
              onChange={e => setActivityForm(f => ({ ...f, activityType: e.target.value }))}
            >
              {['Mers', 'Alergare', 'Ciclism', 'Alte activități fizice'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durată zilnică (minute)</label>
            <input
              type="number"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={activityForm.dailyDurationMinutes}
              onChange={e => setActivityForm(f => ({ ...f, dailyDurationMinutes: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alte instrucțiuni</label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
              value={activityForm.description}
              onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data start</label>
              <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
                value={activityForm.startDate} onChange={e => setActivityForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data stop</label>
              <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none"
                value={activityForm.endDate} onChange={e => setActivityForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowActivityDialog(false)}>Anulează</Button>
          <Button onClick={handleAddActivityRec} disabled={savingActivity}>
            {savingActivity ? 'Se salvează...' : 'Adaugă'}
          </Button>
        </DialogFooter>
      </Dialog>

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
