export default function TopBar({ title, subtitle, action }) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
