import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Clock, Bell, Radio } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { alarmAPI } from '@/services/api'
import { mapAlarmFromAPI } from '@/services/mappers'
import { useRealtime } from '@/hooks/useRealtime'
import { RT_EVENTS } from '@/services/realtime'

const severityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }
const statusVariant   = { Active: 'red', Resolved: 'green' }
const severities = ['Toate', 'Înalte', 'Medii']
const statuses   = ['Toate', 'Activ', 'Rezolvate']

export default function LiveAlarms() {
  const [alarms, setAlarms]         = useState([])
  const [severityFilter, setSev]    = useState('Toate')
  const [statusFilter,   setStatus] = useState('Toate')
  const [live, setLive]             = useState(false)
  const [page, setPage]             = useState(1)

  const PAGE_SIZE = 20

  // Resolution dialog
  const [resolveTarget, setResolveTarget] = useState(null)
  const [notes, setNotes]                 = useState('')
  const [saving, setSaving]               = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await alarmAPI.getAll()
      setAlarms((response || []).map(mapAlarmFromAPI))
    } catch (error) {
      console.error('Error fetching alarms:', error)
      setAlarms([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Real-time: a brief "live" flash signals the push arrived.
  const flashLive = () => { setLive(true); setTimeout(() => setLive(false), 1500) }
  useRealtime(RT_EVENTS.ALARM_RAISED, (alarm) => {
    if (!alarm) return
    flashLive()
    setAlarms(prev => {
      const mapped = mapAlarmFromAPI(alarm)
      return [mapped, ...prev.filter(a => a.alarmId !== mapped.alarmId)]
    })
  })
  useRealtime(RT_EVENTS.ALARM_RESOLVED, (alarm) => {
    if (!alarm) return
    setAlarms(prev => prev.map(a => a.alarmId === alarm.alarmId ? mapAlarmFromAPI(alarm) : a))
  })

  const counts = {
    active:   alarms.filter(a => a.status === 'Active').length,
    high:     alarms.filter(a => a.severity === 'High' || a.severity === 'Critical').length,
    medium:   alarms.filter(a => a.severity === 'Medium').length,
    resolved: alarms.filter(a => a.status === 'Resolved').length,
  }

  const severityMap = { 'Toate': 'All', 'Înalte': 'High', 'Medii': 'Medium' }
  const statusMap = { 'Toate': 'All', 'Activ': 'Active', 'Rezolvate': 'Resolved' }
  const severityDisplayMap = { 'Critical': 'Critic', 'High': 'Înalt', 'Medium': 'Mediu', 'Low': 'Mic' }
  const statusDisplayMap = { 'Active': 'Activă', 'Resolved': 'Rezolvată' }

  const filtered = alarms
    .filter(a => {
      const mappedSev = severityMap[severityFilter] || severityFilter
      const mappedStatus = statusMap[statusFilter] || statusFilter
      const matchSev    = mappedSev === 'All' || a.severity === mappedSev || (mappedSev === 'High' && a.severity === 'Critical')
      const matchStatus = mappedStatus === 'All' || a.status === mappedStatus
      return matchSev && matchStatus
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset to first page whenever the filters change the result set.
  useEffect(() => { setPage(1) }, [severityFilter, statusFilter])

  const openResolve = (alarm) => { setResolveTarget(alarm); setNotes('') }
  const confirmResolve = async () => {
    if (!resolveTarget) return
    setSaving(true)
    try {
      const updated = await alarmAPI.resolve(resolveTarget.alarmId, notes)
      setAlarms(prev => prev.map(a => a.alarmId === resolveTarget.alarmId ? mapAlarmFromAPI(updated) : a))
      setResolveTarget(null)
    } catch (error) {
      console.error('Error resolving alarm:', error)
      alert('Nu s-a putut rezolva alarma.')
    } finally {
      setSaving(false)
    }
  }

  const fmt = ts => new Date(ts).toLocaleString('ro-RO', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Alarme Live</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitorizare în timp real a alarmelor pacienților</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            live ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
          }`}
          title="Conexiune în timp real"
        >
          <Radio size={13} className={live ? 'animate-pulse' : ''} /> {live ? 'Alarmă nouă' : 'În direct'}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: counts.active, color: '#0f4c81', bg: '#dbeafe', icon: Bell },
          { label: 'Înalte', value: counts.high, color: '#b91c1c', bg: '#fecdd3', icon: AlertTriangle },
          { label: 'Medii', value: counts.medium, color: '#d97706', bg: '#fef9c3', icon: Clock },
          { label: 'Rezolvate', value: counts.resolved, color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3 py-4 px-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs font-medium text-slate-500">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Severitate:</span>
          {severities.map(s => (
            <button key={s} onClick={() => setSev(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={severityFilter === s
                ? { backgroundColor: '#0f4c81', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}
            >{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Stare:</span>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={statusFilter === s
                ? { backgroundColor: '#0f4c81', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}
            >{s}</button>
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
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                  Nu există alarme care să se potrivească cu filtrele actuale.
                </td></tr>
              )}
              {paginated.map(a => {
                const isCritActive = a.severity === 'Critical' && a.status === 'Active'
                return (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50"
                    style={isCritActive ? { backgroundColor: '#fff8f8' } : {}}>
                    <td className="px-5 py-3"><div className="font-medium text-slate-700 text-sm">{a.patientName}</div></td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700 text-sm max-w-xs truncate">{a.message}</div>
                      {a.status === 'Resolved' && a.resolutionNotes && (
                        <div className="text-xs text-slate-400 mt-0.5">Obs: {a.resolutionNotes}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{a.sensor}</td>
                    <td className="px-5 py-3"><span className="text-sm font-bold text-slate-700">{a.value || '-'}</span></td>
                    <td className="px-5 py-3"><Badge variant={severityVariant[a.severity]}>{severityDisplayMap[a.severity] || a.severity}</Badge></td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[a.status]}>{statusDisplayMap[a.status] || a.status}</Badge>
                      {a.status === 'Resolved' && a.resolutionDate && (
                        <div className="text-xs text-slate-400 mt-0.5">{fmt(a.resolutionDate)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 whitespace-nowrap">{fmt(a.timestamp)}</td>
                    <td className="px-5 py-3">
                      {a.status !== 'Resolved' && (
                        <Button size="sm" variant="success" onClick={() => openResolve(a)}>Rezolvă</Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Afișare {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} din {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <span className="text-xs font-medium text-slate-500">Pagina {currentPage} / {totalPages}</span>
              <Button size="sm" variant="ghost" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Următor
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Resolution dialog */}
      <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Rezolvă alarma" maxWidth="max-w-lg">
        <DialogBody className="space-y-3">
          <p className="text-sm text-slate-600">
            Confirmați rezolvarea alarmei pentru <span className="font-semibold">{resolveTarget?.patientName}</span>.
            Data și ora rezolvării se înregistrează automat.
          </p>
          <label className="block text-sm">
            <span className="text-slate-500 text-xs">Observații (opțional)</span>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-[#0f4c81] mt-1"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Măsuri luate..."
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setResolveTarget(null)}>Anulează</Button>
          <Button variant="success" onClick={confirmResolve} disabled={saving}>
            <CheckCircle size={14} /> {saving ? 'Se salvează...' : 'Confirmă rezolvarea'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
