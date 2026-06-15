import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { alarms } from '@/data/mock'
import { patientAPI } from '@/services/api'
import { mapPatientFromAPI, mapPatientToAPI } from '@/services/mappers'
import { useAuth, ROLES } from '@/context/AuthContext'

const activeAlarms = alarms.filter(a => a.status === 'Active')

export default function Patients() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const canAddPatient = hasRole(ROLES.ADMIN) || hasRole(ROLES.MEDIC)
  const [patients, setPatients]   = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]       = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const hasInitialized = React.useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await patientAPI.getAll()
        const transformedPatients = response && response.length > 0
          ? response.map((p, index) => mapPatientFromAPI(p, index))
          : []

        setPatients(transformedPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
        setPatients([])
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
    return matchSearch
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPatient = async () => {
    if (!formData.name || !formData.age || !formData.room) {
      alert('Vă rugăm completați câmpurile obligatorii: Nume, Vârstă, Cameră')
      return
    }

    try {
      const newPatientData = {
        cnp: formData.cnp || Math.random().toString().slice(2, 15),
        age: parseInt(formData.age),
        adresa_Strada: formData.name,
        adresa_Oras: formData.room,
        adresa_Judet: formData.room,
        profesie: formData.profession || '',
        loc_Munca: formData.workplace || '',
      }

      const response = await patientAPI.create(newPatientData)
      const newPatient = mapPatientFromAPI(response)

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
    } catch (error) {
      console.error('Error creating patient:', error)
      alert('Eroare la crearea pacientului')
    }
  }

  return (
    <div className="p-6 space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-slate-800" style={{ fontSize: '32px' }}>Lista Pacienților</h1>
        </div>
        {canAddPatient && (
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0f4c81' }}
          >
            <Plus size={18} />
            Adaugă Pacient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-5 py-3 w-full max-w-xs">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          className="bg-transparent text-slate-700 placeholder-slate-400 outline-none w-full"
          placeholder="Căutați după nume"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#0f4c81' }}>
                {['ID', '', 'Nume', 'CNP', 'Vârstă', 'Telefon', 'Oras', 'Acțiune'].map((h, i) => {
                  const isLeftAligned = [2, 3, 5, 6].includes(i)
                  const paddingClass = i === 0 ? 'px-5' : i === 1 ? 'px-3' : i === 2 ? 'px-2' : i === 3 ? 'px-2' : i === 7 ? 'px-3' : 'px-5'
                  return (
                  <th
                    key={i}
                    className={`${paddingClass} py-3 font-semibold text-white uppercase tracking-wide ${isLeftAligned ? 'text-left' : 'text-center'}`}
                    style={{
                      fontSize: '18px',
                      width: i === 0 ? '40px' : i === 1 ? '50px' : i === 3 ? '80px' : i === 5 ? '220px' : i === 6 ? '160px' : i === 7 ? '100px' : 'auto'
                    }}
                  >
                    {h}
                  </th>
                )})}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const patientAlarms = activeAlarms.filter(a => a.patientId === p.id)
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-600 text-center" style={{ fontSize: '18px' }}>#{p.patientId}</td>
                    <td className="px-3 py-3 flex justify-center">
                      <Avatar name={p.name} size="lg" />
                    </td>
                    <td className="px-2 py-3 text-left">
                      <button
                        className="font-semibold hover:underline cursor-pointer whitespace-nowrap"
                        style={{ color: '#0f4c81', fontSize: '18px' }}
                        onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-slate-600 text-left" style={{ fontSize: '18px' }}>{p.cnp || '-'}</td>
                    <td className="px-5 py-3 text-slate-600 text-center" style={{ fontSize: '18px' }}>{p.age}</td>
                    <td className="px-5 py-3 text-slate-600 text-left max-w-xs" style={{ fontSize: '18px' }}>
                      <span className="truncate block">{p.phone || '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-left max-w-xs" style={{ fontSize: '18px' }}>
                      <span className="truncate block">{p.city || '-'}</span>
                    </td>
                    <td className="px-3 py-3 flex justify-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                        className="font-semibold px-8 py-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#0f4c81', fontSize: '16px' }}
                      >
                        Fisa
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
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
