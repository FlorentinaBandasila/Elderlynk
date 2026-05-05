import { useNavigate } from 'react-router-dom'
import { Users, Stethoscope, Bell, Radio, Activity, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import TopBar from '@/components/layout/TopBar'
import { patients, consultations, alarms, sensors } from '@/data/mock'

const riskVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'green' }
const statusVariant = { Scheduled: 'blue', 'In Progress': 'cyan', Completed: 'green', Cancelled: 'gray' }

const today = '2026-05-06'
const todayConsults = consultations.filter(c => c.date === today)
const activeAlarms = alarms.filter(a => a.status === 'Active')
const criticalPatients = patients.filter(p => p.risk === 'Critical')
const onlineSensors = sensors.filter(s => s.status === 'Online').length

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: '#0f4c81', bg: '#dbeafe', sub: `${patients.filter(p => p.status === 'Admitted').length} admitted` },
    { label: "Today's Consultations", value: todayConsults.length, icon: Stethoscope, color: '#0891b2', bg: '#cffafe', sub: `${todayConsults.filter(c => c.status === 'In Progress').length} in progress` },
    { label: 'Active Alarms', value: activeAlarms.length, icon: Bell, color: '#e63946', bg: '#fee2e2', sub: `${activeAlarms.filter(a => a.severity === 'Critical').length} critical` },
    { label: 'Online Sensors', value: onlineSensors, icon: Radio, color: '#16a34a', bg: '#dcfce7', sub: `${sensors.length} total` },
    { label: 'Critical Patients', value: criticalPatients.length, icon: AlertTriangle, color: '#d97706', bg: '#fef9c3', sub: 'Needs attention' },
  ]

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Clinical Overview — Sunrise Care Center" />
      <div className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
              <CardBody className="flex items-start gap-3 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs font-medium text-slate-600">{s.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's consultations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Today's Consultations</h2>
                  <button onClick={() => navigate('/consultations')} className="text-xs text-[#0f4c81] hover:underline cursor-pointer">View all</button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Patient</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Time</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Mode</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayConsults.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={c.patientName} size="sm" />
                            <span className="font-medium text-slate-700">{c.patientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{c.type}</td>
                        <td className="px-5 py-3 text-slate-600">{c.time}</td>
                        <td className="px-5 py-3">
                          <Badge variant={c.mode === 'Telehealth' ? 'cyan' : 'blue'}>{c.mode}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant[c.status] || 'gray'}>{c.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Active alarms */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Active Alarms</h2>
                  <button onClick={() => navigate('/live-alarms')} className="text-xs text-[#0f4c81] hover:underline cursor-pointer">View all</button>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 py-3">
                {activeAlarms.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No active alarms</p>}
                {activeAlarms.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: a.severity === 'Critical' ? '#fff1f2' : '#fffbeb' }}>
                    <div className="relative flex-shrink-0 mt-0.5">
                      {a.severity === 'Critical' && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: '#e63946' }} />
                      )}
                      <div className="w-2.5 h-2.5 rounded-full relative" style={{ backgroundColor: a.severity === 'Critical' ? '#e63946' : '#d97706' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-700">{a.type}</div>
                      <div className="text-xs text-slate-500">{a.patientName} · Rm {a.room}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.value}</div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Critical patients + recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Critical Patients</h2>
                <button onClick={() => navigate('/patients')} className="text-xs text-[#0f4c81] hover:underline cursor-pointer">View all</button>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 py-3">
              {criticalPatients.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-red-100 hover:border-red-200 cursor-pointer transition-colors"
                  style={{ backgroundColor: '#fff5f5' }}
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <Avatar name={p.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500">Room {p.room} · {p.physician}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.diagnoses[0]}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="red">Critical</Badge>
                    <div className="text-xs text-slate-500 mt-1">HR {p.vitals.hr}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-800">Patient Risk Overview</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Risk</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">HR</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">SpO2</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 6).map(p => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={p.name} size="sm" />
                          <span className="font-medium text-slate-700 text-xs">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5"><Badge variant={riskVariant[p.risk]}>{p.risk}</Badge></td>
                      <td className="px-5 py-2.5 text-slate-600 text-xs">{p.vitals.hr} bpm</td>
                      <td className="px-5 py-2.5">
                        <span className={`text-xs font-medium ${p.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-600'}`}>
                          {p.vitals.spo2}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
