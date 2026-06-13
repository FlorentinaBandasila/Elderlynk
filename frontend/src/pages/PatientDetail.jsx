import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Heart, Wind, Thermometer, Activity,
  User, Stethoscope, Bell, Settings2, Clock, Pencil,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { patients, consultations, sensors } from '@/data/mock'
import { patientAPI } from '@/services/api'
import { mapPatientFromAPI } from '@/services/mappers'

const consultVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

const activityByPatient = {
  p1: [
    { icon: User,        title: 'Caregiver bedside visit',   desc: 'Routine bedside assessment, vitals confirmed',    by: 'Nurse Carla Mendes', time: '23:25' },
    { icon: Pencil,      title: 'Medication administered',   desc: 'Lisinopril 10mg PO',                              by: 'Nurse Carla Mendes', time: '21:09' },
    { icon: Bell,        title: 'Threshold alarm triggered', desc: 'Heart rate exceeded warning threshold',           by: 'System',             time: '19:09' },
    { icon: Stethoscope, title: 'Consultation note added',   desc: 'Reviewed overnight telemetry, no acute changes',  by: 'Dr. Marian Holst',   time: '17:09' },
    { icon: Activity,    title: 'Sensor calibration',        desc: 'Pulse oximeter recalibrated to baseline',         by: 'Tech Riley Park',    time: '02:09' },
  ],
}

function getActivity(id, patient) {
  if (activityByPatient[id]) return activityByPatient[id]
  return [
    { icon: Stethoscope, title: 'Consultation completed', desc: 'Routine follow-up visit',      by: patient.physician || 'Unknown', time: '14:00' },
    { icon: User,        title: 'Vitals recorded',        desc: 'All vitals within normal range', by: 'Nursing staff',   time: '09:00' },
  ]
}

const activityIconColor = {
  User: '#64748b', Pencil: '#0f4c81', Bell: '#e63946',
  Stethoscope: '#0891b2', Activity: '#d97706', Settings2: '#94a3b8',
}

export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const patientId = parseInt(id.replace('p', ''))
        const response = await patientAPI.getById(patientId)
        const transformedPatient = mapPatientFromAPI(response)
        setPatient(transformedPatient)
      } catch (err) {
        console.error('Error fetching patient:', err)
        setError(err.message)
        const fallback = patients.find(p => p.id === id)
        setPatient(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  if (loading) return (
    <div className="p-10 text-center text-slate-500">Loading...</div>
  )

  if (!patient) return (
    <div className="p-10 text-center text-slate-500">Pacientul nu a fost găsit.</div>
  )

  const patientConsults = consultations.filter(c => c.patientId === id)
  const patientSensors  = sensors.filter(s => s.patientId === id)
  const activity        = getActivity(id, patient)

  const vitals = [
    {
      label: 'Ritm Cardiac',       value: patient.vitals.hr,   unit: 'bpm',  icon: Heart,       color: '#e63946',
      trend: -1.0, warn: patient.vitals.hr > 100 || patient.vitals.hr < 55,
    },
    {
      label: 'Ritm Respirator', value: 19,                  unit: 'bpm',  icon: Wind,        color: '#0f4c81',
      trend: +1.8, warn: false,
    },
    {
      label: 'SpO₂',             value: patient.vitals.spo2, unit: '%',    icon: Wind,        color: '#00b4d8',
      trend: +0.3, warn: patient.vitals.spo2 < 92,
    },
    {
      label: 'PA Sistolică',      value: patient.vitals.bp,   unit: 'mmHg', icon: Activity,    color: '#7c3aed',
      trend: -0.5, warn: false,
    },
    {
      label: 'Temperatură',      value: patient.vitals.temp, unit: '°C',   icon: Thermometer, color: '#d97706',
      trend: -0.1, warn: patient.vitals.temp > 38,
    },
  ]

  return (
    <div className="p-6 space-y-5">

      {/* Back */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
      >
        <ArrowLeft size={14} /> Înapoi la pacienți
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-800">Vedere Generală Pacient</h1>

      {/* Header card */}
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
                    <span>{patient.age} y/o {patient.gender}</span>
                    <span>·</span>
                    <span>Room {patient.room}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Stethoscope size={13} style={{ color: '#0f4c81' }} />
                      <span style={{ color: '#0f4c81' }}>{patient.physician}</span>
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
                  {patient.status === 'Admitted' ? 'Stable' : 'Outpatient'}
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

        {/* Left: vitals + 24h trends + sensors + consults */}
        <div className="lg:col-span-2 space-y-5">

          {/* Current Vitals */}
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
                      <div
                        className="text-sm mt-2"
                        style={{ color: v.trend > 0 ? '#16a34a' : '#e63946' }}
                      >
                        {v.trend > 0 ? '↑' : '↓'} {Math.abs(v.trend)}% vs last hour
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* 24h Trends placeholder */}
          <Card>
            <CardBody className="py-5">
              <h3 className="text-base font-bold text-slate-700 mb-4">24h Vital Trends</h3>
              <div
                className="flex items-center justify-center rounded-lg text-sm text-slate-400"
                style={{ height: '120px', backgroundColor: '#f8fafc' }}
              >
                No history available.
              </div>
            </CardBody>
          </Card>

          {/* Sensors */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Sensor Readings</h3>
              <div className="space-y-3">
                {patientSensors.length === 0 && (
                  <p className="text-sm text-slate-400">No sensors assigned.</p>
                )}
                {patientSensors.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{s.type}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.model} · {s.location}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={s.status === 'Online' ? 'green' : s.status === 'Offline' ? 'red' : 'gray'}>
                        {s.status}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">{s.battery}% battery</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Consultation History */}
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-slate-700 mb-4">Consultation History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Type', 'Date', 'Physician', 'Status'].map(h => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patientConsults.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                          No consultations recorded.
                        </td>
                      </tr>
                    )}
                    {patientConsults.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-700 text-sm">{c.type}</td>
                        <td className="py-3 pr-4 text-slate-500 text-sm">{c.date} {c.time}</td>
                        <td className="py-3 pr-4 text-slate-500 text-sm">{c.physician}</td>
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

        {/* Right: Recent Activity */}
        <div>
          <h3
            className="text-base font-bold mb-3"
            style={{ color: '#0f4c81' }}
          >
            Recent Activity
          </h3>
          <Card>
            <CardBody className="py-3 divide-y divide-slate-50">
              {activity.map((a, i) => {
                const Icon = a.icon
                return (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#f1f5f9' }}
                    >
                      <Icon size={14} style={{ color: '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-700 leading-tight">{a.title}</div>
                        <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{a.time}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <User size={10} /> {a.by}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
