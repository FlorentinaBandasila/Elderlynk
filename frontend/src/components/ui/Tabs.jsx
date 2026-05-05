import { useState } from 'react'

export default function Tabs({ tabs, defaultTab, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key)
  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              active === tab.key
                ? 'text-[#0f4c81] border-b-2 border-[#0f4c81] -mb-px bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={
                  active === tab.key
                    ? { backgroundColor: '#dbeafe', color: '#1d4ed8' }
                    : { backgroundColor: '#f1f5f9', color: '#64748b' }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {typeof children === 'function' ? children(active) : children}
    </div>
  )
}
