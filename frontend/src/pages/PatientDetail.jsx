import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Heart, Wind, Thermometer, Activity } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import TopBar from '@/components/layout/TopBar'
import { patients, consultations, sensors } from '@/data/mock'

const riskVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'green' }
const statusVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.id === id)

  if (!patient) return (
    <div className="p-10 text-center text-slate-500">Patient not found.</div>
  )

  const patientConsults = consultations.filter(c => c.patientId === id)
  const patientSensors = sensors.filter(s => s.patientId === id)

  const vitals = [
    { label: 'Heart Rate', value: `${patient.vitals.hr} bpm`, icon: Heart, color: '#e63946', warn: patient.vitals.hr > 100 || patient.vitals.hr < 55 },
    { label: 'Blood Pressure', value: patient.vitals.bp, icon: Activity, color: '#0f4c81', warn: false },
    { label: 'SpO2', value: `${patient.vitals.spo2}%`, icon: Wind, color: '#00b4d8', warn: patient.vitals.spo2 < 92 },
    { label: 'Temperature', value: `${patient.vitals.temp}°C`, icon: Thermometer, color: '#d97706', warn: patient.vitals.temp > 38 },
  ]

  return (
    <div>
      <TopBar
        title={patient.name}
        subtitle={`${patient.age} y/o · ${patient.gender} · Room ${patient.room}`}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
            <ArrowLeft size={14} /> Back
          </Button>
        }
      />
      <div className="p-6 space-y-6">

        {/* Header card */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-start gap-5">
              <Avatar name={patient.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {patient.age} y/o · {patient.gender} · DOB {patient.dob} · Room {patient.room}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{patient.physician}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={patient.status === 'Admitted' ? 'blue' : 'gray'}>{patient.status}</Badge>
                    <Badge variant={riskVariant[patient.risk]}>{patient.risk} Risk</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400" /> {patient.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" /> {patient.email}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Vitals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vitals.map(v => (
            <Card key={v.label} style={v.warn ? { borderColor: '#fca5a5' } : {}}>
              <CardBody className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: v.warn ? '#fee2e2' : '#f1f5f9' }}>
                  <v.icon size={20} style={{ color: v.warn ? '#e63946' : v.color }} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${v.warn ? 'text-red-600' : 'text-slate-800'}`}>{v.value}</div>
                  <div className="text-xs text-slate-500">{v.label}</div>
                  {v.warn && <div className="text-xs text-red-500 mt-0.5">Abnormal</div>}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Diagnoses & allergies */}
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-800">Clinical Info</h3></CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Diagnoses</div>
                <div className="flex flex-wrap gap-2">
                  {patient.diagnoses.map(d => <Badge key={d} variant="blue">{d}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.length > 0
                    ? patient.allergies.map(a => <Badge key={a} variant="red">{a}</Badge>)
                    : <span className="text-sm text-slate-400">No known allergies</span>}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Active Sensors</div>
                <div className="flex flex-wrap gap-2">
                  {patient.sensors.map(s => <Badge key={s} variant="cyan">{s}</Badge>)}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sensors */}
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-800">Sensor Readings</h3></CardHeader>
            <CardBody className="space-y-3 py-3">
              {patientSensors.length === 0 && <p className="text-sm text-slate-400">No sensors assigned.</p>}
              {patientSensors.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{s.type}</div>
                    <div className="text-xs text-slate-400">{s.model} · {s.location}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={s.status === 'Online' ? 'green' : s.status === 'Offline' ? 'red' : 'gray'}>{s.status}</Badge>
                    <div className="text-xs text-slate-400 mt-1">{s.battery}% battery</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

        </div>

        {/* Consultation history */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-800">Consultation History</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Physician</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Mode</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {patientConsults.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No consultations recorded.</td></tr>
                )}
                {patientConsults.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">{c.type}</td>
                    <td className="px-5 py-3 text-slate-600">{c.date} {c.time}</td>
                    <td className="px-5 py-3 text-slate-600">{c.physician}</td>
                    <td className="px-5 py-3"><Badge variant={c.mode === 'Telehealth' ? 'cyan' : 'blue'}>{c.mode}</Badge></td>
                    <td className="px-5 py-3"><Badge variant={statusVariant[c.status] || 'gray'}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  )
}
