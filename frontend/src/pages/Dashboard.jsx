import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, AlertTriangle, Radio, Clock,
  CheckCircle, Eye, Bell, Timer,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { patientAPI, alarmAPI, sensorConfigAPI } from '@/services/api'
import { mapPatientFromAPI, mapAlarmFromAPI, mapSensorConfigFromAPI } from '@/services/mappers'

const severityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }
const severityLabel   = { Critical: 'Critic', High: 'Înalt', Medium: 'Mediu', Low: 'Mic' }
const statusLabel     = { Active: 'Activă', Resolved: 'Rezolvată' }

// Derived from live API data (recomputed each render below).
let allActive = []
let criticalAlarm = undefined
let offlineSensors = []

const fmt = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })


export default function Dashboard() {
  const navigate = useNavigate()
  const [resolvedIds, setResolvedIds] = useState([])
  const [apiAlarms, setApiAlarms] = useState([])
  const [apiPatients, setApiPatients] = useState([])
  const [apiSensors, setApiSensors] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, alarmsRes, sensorsRes] = await Promise.all([
          patientAPI.getAll().catch(() => []),
          alarmAPI.getAll().catch(() => []),
          sensorConfigAPI.getAll().catch(() => []),
        ])

        console.log('Dashboard - Patients API Response:', patientsRes)
        console.log('Dashboard - Alarms API Response:', alarmsRes)
        console.log('Dashboard - Sensors API Response:', sensorsRes)

        if (patientsRes && patientsRes.length > 0) {
          const mappedPatients = patientsRes.map((p, i) => mapPatientFromAPI(p, i))
          console.log('Dashboard - Mapped Patients:', mappedPatients)
          setApiPatients(mappedPatients)
        }
        if (alarmsRes && alarmsRes.length > 0) {
          const mappedAlarms = alarmsRes.map(mapAlarmFromAPI)
          console.log('Dashboard - Mapped Alarms:', mappedAlarms)
          setApiAlarms(mappedAlarms)
        }
        if (sensorsRes && sensorsRes.length > 0) {
          const mappedSensors = sensorsRes.map(mapSensorConfigFromAPI)
          console.log('Dashboard - Mapped Sensors:', mappedSensors)
          setApiSensors(mappedSensors)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchData()
  }, [])

  // Update references for computed values
  allActive = apiAlarms.filter(a => a.status === 'Active')
  criticalAlarm = allActive.find(a => a.severity === 'Critical')
  offlineSensors = apiSensors.filter(s => s.status === 'Offline')

  const resolve  = id => setResolvedIds(p => [...p, id])
  const pending  = allActive.filter(a => !resolvedIds.includes(a.id))
  const recentAlarms = [...apiAlarms]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 9)
  const critLive = criticalAlarm && !resolvedIds.includes(criticalAlarm.id)

  const stats = [
    {
      label: 'Pacienți Activi',
      value: apiPatients.filter(p => p.status === 'Admitted').length,
      subColor: '#64748b',
      icon: Users,
      iconColor: '#0f4c81',
      iconBg: '#dbeafe',
    },
    {
      label: 'Alarme Critice',
      value: allActive.filter(a => a.severity === 'Critical').length,
      subColor: allActive.filter(a => a.severity === 'Critical').length === 0 ? '#16a34a' : '#e63946',
      icon: AlertTriangle,
      iconColor: '#e63946',
      iconBg: '#fee2e2',
    },
    {
      label: 'Senzori Offline',
      value: offlineSensors.length,
      subColor: offlineSensors.length > 0 ? '#d97706' : '#16a34a',
      icon: Radio,
      iconColor: offlineSensors.length > 0 ? '#d97706' : '#16a34a',
      iconBg: offlineSensors.length > 0 ? '#fef9c3' : '#dcfce7',
    },
    {
      label: 'Timp Răspuns Mediu',
      value: '92s',
      subColor: '#e63946',
      icon: Clock,
      iconColor: '#94a3b8',
      iconBg: '#f1f5f9',
    },
  ]

  const systemStats = [
    {
      label: 'Alarme',
      value: apiAlarms.length,
      unit: 'evenimente',
      icon: Bell,
      iconColor: '#e63946',
    },
    {
      label: 'Timp Răspuns',
      value: '92',
      unit: 'sec',
      icon: Timer,
      iconColor: '#d97706',
    },
    {
      label: 'Personal Online',
      value: 6,
      unit: 'activ',
      icon: Users,
      iconColor: '#0f4c81',
    },
    {
      label: 'Cazuri Critice',
      value: apiPatients.filter(p => p.risk === 'Critical').length,
      unit: 'activ',
      icon: AlertTriangle,
      iconColor: '#d97706',
    },
  ]

  return (
    <div className="p-6 space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardBody className="flex items-start justify-between py-5 px-5">
              <div>
                <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                <div className="text-5xl font-bold text-slate-800 leading-none my-2">{s.value}</div>
                <div className="text-sm" style={{ color: s.subColor }}>{s.sub}</div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ backgroundColor: s.iconBg }}
              >
                <s.icon size={18} style={{ color: s.iconColor }} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left col (2/3) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Critical alert banner */}
          {critLive && criticalAlarm && (
            <Card style={{ borderColor: '#fca5a5' }}>
              <CardBody className="py-5">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}
                    >
                      {criticalAlarm.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: '#e63946' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="red">CRITIC</Badge>
                      <span className="text-sm text-slate-500">Alertă Live</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{criticalAlarm.patientName}</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Salon {criticalAlarm.room} · {criticalAlarm.sensor} — {criticalAlarm.type}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(criticalAlarm.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolve(criticalAlarm.id)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#0f4c81' }}
                    >
                      <AlertTriangle size={14} /> Rezolvă
                    </button>
                    <button
                      onClick={() => navigate(`/patients/${criticalAlarm.patientId}`)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer border border-slate-200 hover:border-slate-300 transition-colors text-center"
                    >
                      Fisa Pacient
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}


          {/* My Patients */}
          <Card>
            <CardBody className="py-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Pacienții Mei</h2>
                <button
                  onClick={() => navigate('/patients')}
                  className="text-sm cursor-pointer hover:underline"
                  style={{ color: '#0f4c81' }}
                >
                  Vezi toți
                </button>
              </div>
              <div className="flex gap-6 flex-wrap">
                {apiPatients.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative">
                      <Avatar name={p.name} size="lg" />
                      {allActive.some(a => a.patientId === p.id) && (
                        <span
                          className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: '#e63946' }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                      {p.name.split(' ').map((n, i) => i === 0 ? n[0] + '.' : n).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Alarms table */}
          <Card>
            <CardBody className="py-5 px-0 pb-0">
              <div className="flex items-center justify-between px-5 mb-4">
                <h2 className="text-lg font-bold text-slate-800">Alarme Recente</h2>
                <button
                  onClick={() => navigate('/live-alarms')}
                  className="text-sm cursor-pointer hover:underline"
                  style={{ color: '#0f4c81' }}
                >
                  Vezi toți
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Pacient', 'Cauză', 'Severitate', 'Oră', 'Acțiune'].map(h => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentAlarms.map(a => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={a.patientName} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-700 text-sm">{a.patientName}</div>
                            <div className="text-xs text-slate-400">Salon {a.room}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-700 text-sm">{a.type}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.value}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={severityVariant[a.severity]}>{severityLabel[a.severity] || a.severity}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{fmt(a.timestamp)}</td>
                      <td className="px-5 py-3.5">
                        {a.status === 'Active' && !resolvedIds.includes(a.id) ? (
                          <button
                            onClick={() => navigate('/live-alarms')}
                            className="flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline"
                            style={{ color: '#0f4c81' }}
                          >
                            <Eye size={14} /> Vezi
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-slate-400">
                            <CheckCircle size={14} style={{ color: '#16a34a' }} />
                            {statusLabel[a.status] || a.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-5">

          {/* System Status */}
          <Card>
            <CardBody className="py-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">Stare Sistem</h2>
                <span className="text-xs text-slate-400">Ultimele 24 ore</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {systemStats.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <item.icon size={13} style={{ color: item.iconColor }} />
                      <span className="text-xs text-slate-500">{item.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 leading-none">
                      {item.value}
                      <span className="text-sm font-normal text-slate-400 ml-1">{item.unit}</span>
                    </div>
                    {item.sub && (
                      <div className="text-xs mt-1 font-medium" style={{ color: item.subColor }}>
                        {item.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Pending Resolutions */}
          <Card>
            <CardBody className="py-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">În Așteptare</h2>
                <button
                  onClick={() => navigate('/live-alarms')}
                  className="text-sm cursor-pointer hover:underline"
                  style={{ color: '#0f4c81' }}
                >
                  Vezi toți
                </button>
              </div>
              <div className="space-y-4">
                {pending.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle size={22} className="mx-auto mb-2" style={{ color: '#16a34a' }} />
                    <p className="text-sm text-slate-400">Toate alarmele rezolvate</p>
                  </div>
                )}
                {pending.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-3">
                    <Avatar name={a.patientName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{a.patientName}</div>
                      <div className="text-xs text-slate-400 truncate">{a.type} · Salon {a.room}</div>
                    </div>
                    <button
                      onClick={() => resolve(a.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer transition-colors flex-shrink-0"
                    >
                      Rezolvă
                    </button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  )
}
