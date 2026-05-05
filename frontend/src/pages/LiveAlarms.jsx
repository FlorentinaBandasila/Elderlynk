import { useState } from 'react'
import { Bell, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import TopBar from '@/components/layout/TopBar'
import { alarms as initialAlarms } from '@/data/mock'

const severityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }
const statusVariant   = { Active: 'red', Acknowledged: 'yellow', Resolved: 'green' }

const severities = ['All', 'Critical', 'High', 'Medium', 'Low']
const statuses   = ['All', 'Active', 'Acknowledged', 'Resolved']

export default function LiveAlarms() {
  const [alarms, setAlarms] = useState(initialAlarms)
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter,   setStatusFilter]   = useState('All')

  const counts = {
    active:       alarms.filter(a => a.status === 'Active').length,
    acknowledged: alarms.filter(a => a.status === 'Acknowledged').length,
    resolved:     alarms.filter(a => a.status === 'Resolved').length,
    critical:     alarms.filter(a => a.severity === 'Critical' && a.status === 'Active').length,
  }

  const filtered = alarms.filter(a => {
    const matchSev    = severityFilter === 'All' || a.severity === severityFilter
    const matchStatus = statusFilter   === 'All' || a.status   === statusFilter
    return matchSev && matchStatus
  })

  const acknowledge = id => setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a))
  const resolve     = id => setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' }     : a))

  return (
    <div>
      <TopBar title="Live Alarms" subtitle="Real-time patient alarm monitoring" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active',       value: counts.active,       color: '#e63946', bg: '#fee2e2' },
            { label: 'Critical',     value: counts.critical,     color: '#b91c1c', bg: '#fecdd3' },
            { label: 'Acknowledged', value: counts.acknowledged, color: '#d97706', bg: '#fef9c3' },
            { label: 'Resolved',     value: counts.resolved,     color: '#16a34a', bg: '#dcfce7' },
          ].map(s => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
                  {s.value}
                </div>
                <div className="text-sm font-medium text-slate-600">{s.label}</div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 self-center mr-1">Severity:</span>
            {severities.map(s => (
              <button key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  severityFilter === s ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={severityFilter === s ? { backgroundColor: '#0f4c81' } : {}}
              >{s}</button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 self-center mr-1">Status:</span>
            {statuses.map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === s ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={statusFilter === s ? { backgroundColor: '#0f4c81' } : {}}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Alarm list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No alarms match the current filters.</div>
          )}
          {filtered.map(a => (
            <Card key={a.id} style={a.severity === 'Critical' && a.status === 'Active' ? { borderColor: '#fca5a5', backgroundColor: '#fff5f5' } : {}}>
              <CardBody>
                <div className="flex flex-wrap items-start gap-4">
                  {/* Live indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div className="relative">
                      {a.severity === 'Critical' && a.status === 'Active' && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: '#e63946' }} />
                      )}
                      <div className="w-3 h-3 rounded-full relative" style={{
                        backgroundColor: a.status === 'Active'
                          ? (a.severity === 'Critical' ? '#e63946' : '#d97706')
                          : a.status === 'Acknowledged' ? '#d97706' : '#16a34a'
                      }} />
                    </div>
                    {a.severity === 'Critical' && a.status === 'Active' && (
                      <span className="text-xs font-bold" style={{ color: '#e63946' }}>LIVE</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800">{a.type}</div>
                        <div className="text-sm text-slate-600 mt-0.5">{a.patientName} · Room {a.room}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={severityVariant[a.severity]}>{a.severity}</Badge>
                        <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{a.message}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>Sensor: {a.sensor}</span>
                      <span>Value: <strong className="text-slate-600">{a.value}</strong></span>
                      <span>Threshold: {a.threshold}</span>
                      <span>{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {a.status === 'Active' && (
                      <>
                        <Button size="sm" variant="warning" onClick={() => acknowledge(a.id)}>
                          <CheckCircle size={13} /> Acknowledge
                        </Button>
                        <Button size="sm" variant="success" onClick={() => resolve(a.id)}>
                          <XCircle size={13} /> Resolve
                        </Button>
                      </>
                    )}
                    {a.status === 'Acknowledged' && (
                      <Button size="sm" variant="success" onClick={() => resolve(a.id)}>
                        <XCircle size={13} /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
