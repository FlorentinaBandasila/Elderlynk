import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

/**
 * Dropdown cu căutare (combobox).
 *
 * options: [{ value, label, sublabel? }]
 * value:    valoarea selectată (string)
 * onChange: (value, option) => void   — apelat la selecție/golire
 *
 * Filtrează după value, label și sublabel. Se închide la click în afară.
 */
export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Selectați...',
  searchPlaceholder = 'Căutați...',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = useMemo(
    () => options.find(o => o.value === value) || null,
    [options, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o =>
      o.value.toLowerCase().includes(q) ||
      o.label.toLowerCase().includes(q) ||
      (o.sublabel || '').toLowerCase().includes(q)
    )
  }, [options, query])

  // Închide la click în afara componentei.
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus pe câmpul de căutare la deschidere.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const select = (opt) => {
    onChange(opt.value, opt)
    setOpen(false)
    setQuery('')
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange('', null)
    setQuery('')
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-left outline-none focus:border-blue-500"
      >
        <span className={selected ? 'text-slate-700 truncate' : 'text-slate-400 truncate'}>
          {selected ? `${selected.value} · ${selected.label}` : placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span onClick={clear} className="text-slate-400 hover:text-red-500" title="Golește">
              <X size={15} />
            </span>
          )}
          <ChevronDown size={16} className="text-slate-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-[10000] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm text-slate-700 outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">Niciun rezultat.</li>
            )}
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                    opt.value === value ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="font-medium text-slate-700">{opt.value}</span>
                  <span className="text-slate-500"> · {opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
