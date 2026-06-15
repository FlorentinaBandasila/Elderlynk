import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Heart, Wind, Thermometer, Activity, Stethoscope, User, ClipboardList
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { patientAPI, consultationAPI, deviceAPI, userAPI, medicalRecommendationAPI } from '@/services/api'
import { mapPatientFromAPI, mapConsultationFromAPI, mapDeviceFromAPI } from '@/services/mappers'

const consultVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

const activityIconColor = {
  User: '#64748b', Pencil: '#0f4c81', Bell: '#e63946',
  Stethoscope: '#0891b2', Activity: '#d97706', Settings2: '#94a3b8',
}

export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [devices, setDevices] = useState([])
  const [medicalRecommendations, setMedicalRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [doctorNames, setDoctorNames] = useState({})
  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const patientId = parseInt(id.replace('p', ''))

        // Fetch patient data
        const patientResponse = await patientAPI.getById(patientId)
        const transformedPatient = mapPatientFromAPI(patientResponse)
        setPatient(transformedPatient)

        let consultationsResponse = []

        // Fetch consultations
        try {
          consultationsResponse = await consultationAPI.getAll()
          const patientConsults = consultationsResponse
            .filter(c => c.patientId === patientId)
            .map(mapConsultationFromAPI)
          setConsultations(patientConsults)
        } catch (err) {
          console.error('Error fetching consultations:', err)
          setConsultations([])
        }

        // Fetch devices/sensors
        try {
          const devicesResponse = await deviceAPI.getAll()
          const patientDevices = devicesResponse
            .filter(d => d.patientId === patientId)
            .map(mapDeviceFromAPI)
          setDevices(patientDevices)
        } catch (err) {
          console.error('Error fetching devices:', err)
          setDevices([])
        }

        // Fetch medical recommendations
        try {
          const recsResponse = await medicalRecommendationAPI.getByPatientId(patientId)
          setMedicalRecommendations(Array.isArray(recsResponse) ? recsResponse : [])
        } catch (err) {
          console.error('Error fetching medical recommendations:', err)
          setMedicalRecommendations([])
        }

        // Fetch doctor names
        try {
          const doctorIds = new Set()
          if (consultationsResponse && consultationsResponse.length > 0) {
            consultationsResponse.forEach(c => {
              if (c.doctorId) doctorIds.add(c.doctorId)
            })
          }

          const names = {}
          for (const docId of doctorIds) {
            try {
              const doctorData = await userAPI.getById(docId)
              const firstName = doctorData.FirstName || doctorData.firstName || ''
              const lastName = doctorData.LastName || doctorData.lastName || ''
              names[docId] = [firstName, lastName].filter(Boolean).join(' ') || 'Necunoscut'
            } catch (err) {
              console.error(`Error fetching doctor ${docId}:`, err)
              names[docId] = 'Necunoscut'
            }
          }
          setDoctorNames(names)
        } catch (err) {
          console.error('Error fetching doctor names:', err)
        }
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
                    <span>Salon {patient.room}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Stethoscope size={13} style={{ color: '#0f4c81' }} />
                      <span style={{ color: '#0f4c81' }}>{patient.physician || 'Necunoscut'}</span>
                    </span>
                  </div>
                </div>
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

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Diagnostic Principal
                  </div>
                  <div className="text-slate-700 font-medium">{patient.diagnoses[0]}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Secundar
                  </div>
                  <div className="text-slate-500 text-sm">
                    {patient.diagnoses.slice(1).join(', ') || 'Niciunu'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Alergii
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: patient.allergies.length > 0 ? '#e63946' : '#94a3b8' }}
                  >
                    {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Niciuna cunoscută'}
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
                        <td className="py-3 pr-4 text-slate-500 text-sm">{doctorNames[c.doctorId] || c.physician || 'Necunoscut'}</td>
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
                {consultations.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Nicio activitate înregistrată.</p>
                ) : (
                  consultations.slice(0, 5).map((c, i) => (
                    <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#f1f5f9' }}
                      >
                        <Stethoscope size={14} style={{ color: '#0891b2' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-700 leading-tight">Consultație</div>
                          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{c.date}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.presentationReason || 'Consultație medicală'}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <User size={10} /> {doctorNames[c.doctorId] || c.physician || 'Medic necunoscut'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>

          {/* Recomandări */}
          <div>
            <h3
              className="text-base font-bold mb-3"
              style={{ color: '#0f4c81' }}
            >
              Recomandări
            </h3>
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
                          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                            {r.dataRecomandarii
                              ? new Date(r.dataRecomandarii).toLocaleDateString('ro-RO')
                              : ''}
                          </span>
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
    </div>
  )
}
