import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, ChevronRight, Heart, Wind, Thermometer, AlertTriangle, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { patients as initialPatients, alarms } from '@/data/mock'

const riskVariant = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'green' }
const risks = ['Toate', 'Critic', 'Înalt', 'Mediu', 'Mic']
const activeAlarms = alarms.filter(a => a.status === 'Active')

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients]   = useState(initialPatients)
  const [loading, setLoading] = useState(false)
  const [search, setSearch]       = useState('')
  const [riskFilter, setRisk]     = useState('All')
  const [expanded, setExpanded]   = useState(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/patients')
        const data = await response.json()

        const transformedPatients = data.map((p, index) => ({
          id: `p${p.patientId}`,
          name: `${p.street || 'Pacient'} ${index}`,
          age: p.age || 0,
          gender: 'N/A',
          room: `${p.city || 'N/A'} (${p.county || 'N/A'})`,
          phone: '',
          email: '',
          physician: '',
          diagnoses: [p.profession || 'N/A'],
          allergies: [],
          risk: 'Medium',
          vitals: { hr: 75, bp: '120/80', spo2: 97, temp: 36.8 },
          sensors: [],
          status: 'Admitted',
          cnp: p.cnp
        }))

        setPatients(transformedPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
        setPatients(initialPatients)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    room: '',
    phone: '',
    email: '',
    physician: '',
    diagnoses: '',
    allergies: '',
    risk: 'Low'
  })

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.room.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'All' || p.risk === riskFilter
    return matchSearch && matchRisk
  })

  const toggle = id => setExpanded(e => e === id ? null : id)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPatient = () => {
    if (!formData.name || !formData.age || !formData.room) {
      alert('Vă rugăm completați câmpurile obligatorii: Nume, Vârstă, Cameră')
      return
    }

    const newPatient = {
      id: `p${patients.length + 1}`,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      room: formData.room,
      phone: formData.phone,
      email: formData.email,
      physician: formData.physician,
      diagnoses: formData.diagnoses ? formData.diagnoses.split(',').map(d => d.trim()) : [],
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      risk: formData.risk,
      vitals: { hr: 75, bp: '120/80', spo2: 97, temp: 36.8 },
      sensors: [],
      status: 'Admitted',
    }

    setPatients(prev => [...prev, newPatient])
    setShowDialog(false)
    setFormData({
      name: '',
      age: '',
      gender: 'Female',
      room: '',
      phone: '',
      email: '',
      physician: '',
      diagnoses: '',
      allergies: '',
      risk: 'Low'
    })
  }

  return (
    <div className="p-6 space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Lista Pacienților</h1>
          <p className="text-sm text-slate-500 mt-0.5">{patients.length} pacienți înregistrați</p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0f4c81' }}
        >
          <Plus size={18} />
          Adaugă Pacient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-52 max-w-xs">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            placeholder="Căutați după nume sau cameră..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {risks.map(r => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={riskFilter === r
                ? { backgroundColor: '#0f4c81', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#475569' }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#0f4c81' }}>
                {['Pacient', 'Cameră', 'Vârstă', 'Diagnostic', 'Stare', 'Actualizat', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide"
                    style={i === 6 ? { width: '32px' } : {}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const patientAlarms = activeAlarms.filter(a => a.patientId === p.id)
                const isExpanded = expanded === p.id
                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors"
                      onClick={() => toggle(p.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} size="sm" />
                          <div>
                            <button
                              className="font-semibold text-sm hover:underline cursor-pointer"
                              style={{ color: '#0f4c81' }}
                              onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                            >
                              {p.name}
                            </button>
                            {patientAlarms.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <AlertTriangle size={11} style={{ color: '#e63946' }} />
                                <span className="text-xs" style={{ color: '#e63946' }}>
                                  {patientAlarms.length} alarmă{patientAlarms.length > 1 ? 'e active' : ' activă'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">Cameră {p.room}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{p.age}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 max-w-xs">
                        <span className="truncate block">{p.diagnoses[0]}</span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={riskVariant[p.risk]}>{p.risk}</Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">May 6, 00:09</td>
                      <td className="px-3 py-3 text-slate-400">
                        {isExpanded
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />
                        }
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-slate-100">
                        <td colSpan={7} style={{ backgroundColor: '#f0f6ff', padding: '0' }}>
                          <div className="px-8 py-4 flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Heart size={14} style={{ color: '#e63946' }} />
                              <span className="text-xs text-slate-500">HR</span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: p.vitals.hr > 100 || p.vitals.hr < 55 ? '#e63946' : '#1e293b' }}
                              >
                                {p.vitals.hr} bpm
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind size={14} style={{ color: '#0f4c81' }} />
                              <span className="text-xs text-slate-500">SpO₂</span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: p.vitals.spo2 < 92 ? '#e63946' : '#1e293b' }}
                              >
                                {p.vitals.spo2}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Thermometer size={14} style={{ color: '#d97706' }} />
                              <span className="text-xs text-slate-500">Temp</span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: p.vitals.temp > 38 ? '#e63946' : '#1e293b' }}
                              >
                                {p.vitals.temp}°C
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">BP</span>
                              <span className="text-sm font-bold text-slate-700">{p.vitals.bp}</span>
                            </div>
                            <div className="ml-auto">
                              <button
                                onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#0f4c81' }}
                              >
                                Fisa Pacient
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Nu există pacienți care să se potrivească cu filtrele actuale.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Adaugă Pacient Nou" maxWidth="max-w-2xl">
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nume *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Introduceti numele pacientului"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vârstă *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Introduceti varsta"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gen
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cameră *
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Ex: 204A"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ex: +1 (555) 123-4567"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ex: patient@mail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Medic Physician
              </label>
              <input
                type="text"
                name="physician"
                value={formData.physician}
                onChange={handleInputChange}
                placeholder="Ex: Dr. Sarah Chen"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Diagnostice (separate prin virgulă)
              </label>
              <input
                type="text"
                name="diagnoses"
                value={formData.diagnoses}
                onChange={handleInputChange}
                placeholder="Ex: CHF Stage III, T2 Diabetes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alergii (separate prin virgulă)
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="Ex: Penicillin, Sulfa drugs"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nivel de Risc
              </label>
              <select
                name="risk"
                value={formData.risk}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <button
            onClick={() => setShowDialog(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Anulează
          </button>
          <button
            onClick={handleAddPatient}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: '#0f4c81' }}
          >
            Adaugă Pacient
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
