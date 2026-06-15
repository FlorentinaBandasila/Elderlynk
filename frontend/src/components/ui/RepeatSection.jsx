import { Plus, Trash2 } from 'lucide-react'

export const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500'

/**
 * A repeatable form section: a titled group of rows with an "Adaugă" button and a
 * per-row delete control. Always keeps at least one row. `renderRow(row, index)`
 * renders the inputs for a single row.
 */
export default function RepeatSection({ title, rows, onAdd, onRemove, renderRow }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold" style={{ color: '#0f4c81' }}>{title}</h4>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer text-white"
          style={{ backgroundColor: '#0f4c81' }}
        >
          <Plus size={14} /> Adaugă
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">{renderRow(row, i)}</div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              disabled={rows.length === 1}
              className="mt-1 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Șterge"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
