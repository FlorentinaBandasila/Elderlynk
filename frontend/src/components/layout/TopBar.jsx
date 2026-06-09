import { Bell, RefreshCw, Search } from 'lucide-react'
import { notifications } from '@/data/mock'

const unread = notifications.filter(n => !n.read).length

export default function TopBar({ title, subtitle, action }) {
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-56">
        <Search size={14} className="text-slate-400" />
        <input
          className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          placeholder="Căutați..."
        />
      </div>
      <span className="hidden lg:block text-sm text-slate-400">{now}</span>
      {action}
      <button className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer relative" title="Notifications">
        <Bell size={18} className="text-slate-500" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#e63946' }} />
        )}
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Refresh">
        <RefreshCw size={18} className="text-slate-500" />
      </button>
    </div>
  )
}
