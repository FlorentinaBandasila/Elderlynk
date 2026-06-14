import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Clock, Bell } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { alarms as initialAlarms } from '@/data/mock'
import { alarmAPI } from '@/services/api'
import { mapAlarmFromAPI, mapAlarmToAPI } from '@/services/mappers'

const severityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }
const statusVariant   = { Active: 'red', Acknowledged: 'yellow', Resolved: 'green' }
const severities = ['Toate', 'Înalte', 'Medii']
const statuses   = ['Toate', 'Activ', 'Rezolvate']

export default function LiveAlarms() {
  const [alarms, setAlarms]         = useState(initialAlarms)
  const [severityFilter, setSev]    = useState('Toate')
  const [statusFilter,   setStatus] = useState('Toate')

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await alarmAPI.getAll()
        console.log('Alarms API Response:', response)

        // Use API data directly
        const transformedAlarms = response && response.length > 0
          ? response.map(mapAlarmFromAPI)
          : []

        console.log('Transformed Alarms:', transformedAlarms)
        setAlarms(transformedAlarms)
      } catch (error) {
        console.error('Error fetching alarms:', error)
        setAlarms([]) // Show empty, not mock data
      }
    }

    fetchAlarms()
  }, [])

  const counts = {
    active:       alarms.length,
    critical:     alarms.filter(a => a.severity === 'High').length,
    medium:       alarms.filter(a => a.severity === 'Medium').length,
    resolved:     alarms.filter(a => a.status === 'Resolved').length,
  }

  const severityMap = { 'Toate': 'All', 'Înalte': 'High', 'Medii': 'Medium' }
  const statusMap = { 'Toate': 'All', 'Activ': 'Active', 'Rezolvate': 'Resolved' }
  const severityDisplayMap = { 'Critical': 'Critic', 'High': 'Înalt', 'Medium': 'Mediu', 'Low': 'Mic' }
  const statusDisplayMap = { 'Active': 'Activ', 'Acknowledged': 'Recunoscut', 'Resolved': 'Rezolvat' }

  const filtered = alarms.filter(a => {
    const mappedSev = severityMap[severityFilter] || severityFilter
    const mappedStatus = statusMap[statusFilter] || statusFilter
    const matchSev    = mappedSev === 'All' || a.severity === mappedSev
    const matchStatus = mappedStatus === 'All' || a.status === mappedStatus
    return matchSev && matchStatus
  })

  const acknowledge = async (id) => {
    const alarm = alarms.find(a => a.id === id)
    if (alarm) {
      try {
        await alarmAPI.update(alarm.alarmId, { isResolved: false })
        setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a))
      } catch (error) {
        console.error('Error acknowledging alarm:', error)
      }
    }
  }

  const resolve = async (id) => {
    const alarm = alarms.find(a => a.id === id)
    if (alarm) {
      try {
        await alarmAPI.update(alarm.alarmId, { isResolved: true })
        setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a))
      } catch (error) {
        console.error('Error resolving alarm:', error)
      }
    }
  }

  const fmt = ts => new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-5">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Alarme Live</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitorizare în timp real a alarmelor pacienților</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alarme', value: counts.active,       color: '#0f4c81', bg: '#dbeafe', icon: Bell },
          { label: 'Înalte',     value: counts.critical,     color: '#b91c1c', bg: '#fecdd3', icon: AlertTriangle },
          { label: 'Medii',      value: counts.medium,       color: '#d97706', bg: '#fef9c3', icon: Clock },
          { label: 'Rezolvate',  value: counts.resolved,     color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs font-medium text-slate-500">{s.label}</div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Severitate:</span>
          {severities.map(s => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={severityFilter === s
                ? { backgroundColor: '#0f4c81', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#475569' }
              }
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Stare:</span>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={statusFilter === s
                ? { backgroundColor: '#0f4c81', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#475569' }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Jurnal Alarme</h2>
            <Badge variant="blue">{filtered.length} rezultat{filtered.length !== 1 ? 'e' : ''}</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Pacient', 'Alarmă', 'Senzor', 'Valoare', 'Severitate', 'Stare', 'Oră', 'Acțiuni'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Nu există alarme care să se potrivească cu filtrele actuale.
                  </td>
                </tr>
              )}
              {filtered.map(a => {
                const isCritActive = a.severity === 'Critical' && a.status === 'Active'
                return (
                  <tr
                    key={a.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                    style={isCritActive ? { backgroundColor: '#fff8f8' } : {}}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-700 text-sm">{a.patientName}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700 text-sm max-w-xs truncate">{a.message}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{a.sensor}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-slate-700">{a.value || '-'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={severityVariant[a.severity]}>{severityDisplayMap[a.severity] || a.severity}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[a.status]}>{statusDisplayMap[a.status] || a.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 whitespace-nowrap">{fmt(a.timestamp)}</td>
                    <td className="px-5 py-3">
                      {a.status !== 'Resolved' && (
                        <Button size="sm" variant="success" onClick={() => resolve(a.id)}>
                          Rezolva
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
