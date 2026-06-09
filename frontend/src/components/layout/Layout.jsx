import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="flex-1 min-h-screen bg-[#eef2f7] transition-all duration-300"
        style={{ marginLeft: collapsed ? '64px' : '240px' }}
      >
        <Outlet />
      </main>
    </div>
  )
}
