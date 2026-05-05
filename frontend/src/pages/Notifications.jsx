import { useState } from 'react'
import { Bell, AlertTriangle, Stethoscope, Monitor, CheckCheck, X } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import TopBar from '@/components/layout/TopBar'
import { notifications as initialNotifs } from '@/data/mock'

const typeIcon = {
  alarm:        <AlertTriangle size={16} style={{ color: '#e63946' }} />,
  consultation: <Stethoscope size={16} style={{ color: '#0f4c81' }} />,
  system:       <Monitor size={16} style={{ color: '#64748b' }} />,
}

const priorityVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'gray' }

const typeFilters = ['All', 'alarm', 'consultation', 'system']

export default function Notifications() {
  const [notifs, setNotifs]   = useState(initialNotifs)
  const [typeFilter, setType] = useState('All')

  const unread = notifs.filter(n => !n.read).length

  const markRead     = id => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss      = id => setNotifs(prev => prev.filter(n => n.id !== id))
  const markAllRead  = ()  => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  const filtered = typeFilter === 'All' ? notifs : notifs.filter(n => n.type === typeFilter)

  const fmt = ts => new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      <TopBar title="Notifications" subtitle={`${unread} unread`} />
      <div className="p-6 space-y-5">

        {/* Header actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {typeFilters.map(t => (
              <button key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer capitalize transition-colors ${
                  typeFilter === t ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={typeFilter === t ? { backgroundColor: '#0f4c81' } : {}}
              >{t}</button>
            ))}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">All Notifications</h2>
              <Badge variant="blue">{notifs.length} total</Badge>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No notifications.</div>
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
                    <button onClick={() => markRead(n.id)} title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600">
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => dismiss(n.id)} title="Dismiss"
                    className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
