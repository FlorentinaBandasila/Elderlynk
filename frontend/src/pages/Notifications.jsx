import { useState, useEffect, useCallback } from 'react'
import { Bell, AlertTriangle, Stethoscope, Monitor, CheckCheck, X } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { alarmAPI } from '@/services/api'
import { useRealtime } from '@/hooks/useRealtime'
import { RT_EVENTS } from '@/services/realtime'

const typeIcon = {
  alarm:        <AlertTriangle size={16} style={{ color: '#e63946' }} />,
  consultation: <Stethoscope size={16} style={{ color: '#0f4c81' }} />,
  system:       <Monitor size={16} style={{ color: '#64748b' }} />,
}

const priorityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }

const typeFilters = [
  { key: 'All', label: 'Toate' },
  { key: 'alarm', label: 'Alarme' },
]

// Turns an alarm DTO into a notification row.
function alarmToNotif(alarm) {
  const isCritical = (alarm.alarmType || '').toUpperCase() === 'CRITICAL' || (alarm.alarmType || '').toUpperCase() === 'ALARMA'
  const patientName = [alarm.patientFirstName, alarm.patientLastName].filter(Boolean).join(' ')
  return {
    id: `a${alarm.alarmId}`,
    type: 'alarm',
    priority: isCritical ? 'Critical' : 'High',
    title: alarm.alarmType || 'Alarmă',
    message: patientName ? `${patientName}: ${alarm.message || ''}` : (alarm.message || ''),
    timestamp: alarm.triggerDate || new Date().toISOString(),
    read: !!alarm.isResolved,
  }
}

export default function Notifications() {
  const [notifs, setNotifs]   = useState([])
  const [typeFilter, setType] = useState('All')
  const [readIds, setReadIds] = useState([])      // locally-dismissed/read ids
  const [hiddenIds, setHidden] = useState([])

  const load = useCallback(async () => {
    try {
      const alarmsRes = await alarmAPI.getAll().catch(() => [])
      const rows = (alarmsRes || []).map(alarmToNotif)
      rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setNotifs(rows)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifs([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Real-time: prepend new alarms, refresh on resolution.
  useRealtime(RT_EVENTS.ALARM_RAISED, (alarm) => {
    if (!alarm) return
    setNotifs(prev => [alarmToNotif(alarm), ...prev.filter(n => n.id !== `a${alarm.alarmId}`)])
  })
  useRealtime(RT_EVENTS.ALARM_RESOLVED, () => load())

  const decorated = notifs
    .filter(n => !hiddenIds.includes(n.id))
    .map(n => ({ ...n, read: n.read || readIds.includes(n.id) }))

  const unread = decorated.filter(n => !n.read).length

  const markRead    = id => setReadIds(prev => [...new Set([...prev, id])])
  const dismiss     = id => setHidden(prev => [...prev, id])
  const markAllRead = () => setReadIds(decorated.map(n => n.id))

  const filtered = typeFilter === 'All' ? decorated : decorated.filter(n => n.type === typeFilter)

  const fmt = ts => new Date(ts).toLocaleString('ro-RO', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Notificări</h1>
        <p className="text-slate-500 mt-1">{unread} notificare necitită{unread !== 1 ? '' : ''}</p>
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {typeFilters.map(t => (
            <button key={t.key}
              onClick={() => setType(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                typeFilter === t.key ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
              style={typeFilter === t.key ? { backgroundColor: '#0f4c81' } : {}}
            >{t.label}</button>
          ))}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Marchează toate ca citite
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Toate Notificările</h2>
            <Badge variant="blue">{decorated.length} total</Badge>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">Nicio notificare.</div>
          )}
          {filtered.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 mt-0.5">
                {typeIcon[n.type] || <Bell size={16} className="text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#0f4c81' }} />}
                    {n.title}
                  </div>
                  <Badge variant={priorityVariant[n.priority] || 'gray'}>{n.priority}</Badge>
                </div>
                <div className="text-sm text-slate-500 mt-0.5">{n.message}</div>
                <div className="text-xs text-slate-400 mt-1">{fmt(n.timestamp)}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} title="Marchează ca citit"
                    className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => dismiss(n.id)} title="Înlătură"
                  className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
