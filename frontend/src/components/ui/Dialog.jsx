export function Dialog({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DialogBody({ children, className = '' }) {
  return <div className={`px-6 py-4 overflow-y-auto ${className}`}>{children}</div>
}

export function DialogFooter({ children }) {
  return (
    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
      {children}
    </div>
  )
}
