import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Heart, Wind, Thermometer } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import TopBar from '@/components/layout/TopBar'
import { patients } from '@/data/mock'

const riskVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'green' }
const risks = ['All', 'Critical', 'High', 'Medium', 'Low']

export default function Patients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.room.toLowerCase().includes(search.toLowerCase()) ||
      p.physician.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'All' || p.risk === riskFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchRisk && matchStatus
  })

  return (
    <div>
      <TopBar title="Patients" subtitle={`${patients.length} patients registered`} />
      <div className="p-6 space-y-5">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-52">
            <Search size={15} className="text-slate-400" />
            <input
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              placeholder="Search by name, room, physician..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {risks.map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  riskFilter === r
                    ? 'text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={riskFilter === r ? { backgroundColor: '#0f4c81' } : {}}
              >
                {r}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Admitted">Admitted</option>
            <option value="Outpatient">Outpatient</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/patients/${p.id}`)}
            >
              <CardBody>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={p.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{p.age} y/o · {p.gender} · Room {p.room}</div>
                      </div>
                      <Badge variant={riskVariant[p.risk]}>{p.risk}</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{p.physician}</div>
                  </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Heart size={11} style={{ color: '#e63946' }} />
                      <span className="text-xs text-slate-500">HR</span>
                    </div>
                    <div className={`text-sm font-bold ${p.vitals.hr > 100 || p.vitals.hr < 55 ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.vitals.hr}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Wind size={11} style={{ color: '#0f4c81' }} />
                      <span className="text-xs text-slate-500">SpO2</span>
                    </div>
                    <div className={`text-sm font-bold ${p.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.vitals.spo2}%
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Thermometer size={11} style={{ color: '#d97706' }} />
                      <span className="text-xs text-slate-500">Temp</span>
                    </div>
                    <div className={`text-sm font-bold ${p.vitals.temp > 38 ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.vitals.temp}°
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-3 truncate">{p.diagnoses.join(' · ')}</div>

                <div className="flex items-center justify-between">
                  <Badge variant={p.status === 'Admitted' ? 'blue' : 'gray'}>{p.status}</Badge>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </CardBody>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">No patients match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}
