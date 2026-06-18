import { useState, useEffect, useRef } from 'react'
import {
  Plus, Search, Cpu, Trash2, Pencil, ChevronDown, ChevronUp,
  Radio, User, AlertCircle,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import SearchSelect from '@/components/ui/SearchSelect'
import { deviceAPI, sensorConfigAPI, patientAPI } from '@/services/api'

// Sensor presets — match the Tip_Senzor values used by the ESP32 devices.
// Picking one pre-fills type/unit/thresholds, but every field stays editable.
const SENSOR_PRESETS = [
  { sensorType: 'Lumina',      measurementUnit: 'lx',  lowerAlarmThreshold: 50, lowerWarningThreshold: 100, upperWarningThreshold: '',  upperAlarmThreshold: '' },
  { sensorType: 'Gaz',         measurementUnit: 'ppm', lowerAlarmThreshold: '', lowerWarningThreshold: '',  upperWarningThreshold: 200, upperAlarmThreshold: 400 },
  { sensorType: 'Temperatura', measurementUnit: '°C',  lowerAlarmThreshold: 35, lowerWarningThreshold: 36,  upperWarningThreshold: 37.5, upperAlarmThreshold: 38.5 },
  { sensorType: 'Puls',        measurementUnit: 'bpm', lowerAlarmThreshold: 40, lowerWarningThreshold: 50,  upperWarningThreshold: 100, upperAlarmThreshold: 120 },
  { sensorType: 'Inundatii',   measurementUnit: '',    lowerAlarmThreshold: '', lowerWarningThreshold: '',  upperWarningThreshold: 1,   upperAlarmThreshold: 1 },
]

const EMPTY_DEVICE = { patientId: '', bluetoothMacAddress: '', installationDate: '', firmwareVersion: '' }
const EMPTY_SENSOR = {
  name: '', sensorType: '', measurementUnit: '', orderNumber: '',
  samplingPeriodSeconds: 600, scaleFactor: 1,
  lowerAlarmThreshold: '', lowerWarningThreshold: '', upperWarningThreshold: '', upperAlarmThreshold: '',
  persistenceSeconds: '', activityGraceSeconds: '', active: true,
}

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500'
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))

export default function Devices() {
  const [devices, setDevices]   = useState([])
  const [sensors, setSensors]   = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState(null)
  const effectRan = useRef(false)

  // ===== Device dialog state =====
  const [deviceDialog, setDeviceDialog] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null) // null = create
  const [deviceForm, setDeviceForm] = useState({ ...EMPTY_DEVICE })

  // ===== Sensor dialog state =====
  const [sensorDialog, setSensorDialog] = useState(false)
  const [sensorDeviceId, setSensorDeviceId] = useState(null)
  const [editingSensor, setEditingSensor] = useState(null) // null = create
  const [sensorForm, setSensorForm] = useState({ ...EMPTY_SENSOR })

  const [submitting, setSubmitting] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [dev, sen, pat] = await Promise.all([
        deviceAPI.getAll(),
        sensorConfigAPI.getAll(),
        patientAPI.getAll(),
      ])
      setDevices(Array.isArray(dev) ? dev : [])
      setSensors(Array.isArray(sen) ? sen : [])
      setPatients(Array.isArray(pat) ? pat : [])
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true
    loadAll()
  }, [])

  const patientName = (id) => {
    if (id == null) return null
    const p = patients.find(p => p.patientId === id)
    if (!p) return `Pacient #${id}`
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || `Pacient #${id}`
  }

  const patientOptions = patients.map(p => ({
    value: String(p.patientId),
    label: [p.firstName, p.lastName].filter(Boolean).join(' ') || `Pacient #${p.patientId}`,
    sublabel: p.cnp || '',
  }))

  const sensorsForDevice = (deviceId) => sensors.filter(s => s.deviceId === deviceId)

  const filtered = devices.filter(d => {
    const q = search.toLowerCase()
    return (
      String(d.deviceId).includes(q) ||
      (d.bluetoothMacAddress || '').toLowerCase().includes(q) ||
      (d.firmwareVersion || '').toLowerCase().includes(q) ||
      (patientName(d.patientId) || '').toLowerCase().includes(q)
    )
  })

  // ===== Device CRUD =====
  const openCreateDevice = () => {
    setEditingDevice(null)
    setDeviceForm({ ...EMPTY_DEVICE, installationDate: new Date().toISOString().split('T')[0] })
    setDeviceDialog(true)
  }

  const openEditDevice = (d) => {
    setEditingDevice(d)
    setDeviceForm({
      patientId: d.patientId != null ? String(d.patientId) : '',
      bluetoothMacAddress: d.bluetoothMacAddress || '',
      installationDate: d.installationDate ? d.installationDate.split('T')[0] : '',
      firmwareVersion: d.firmwareVersion || '',
    })
    setDeviceDialog(true)
  }

  const saveDevice = async () => {
    setSubmitting(true)
    try {
      const payload = {
        patientId: deviceForm.patientId ? Number(deviceForm.patientId) : null,
        bluetoothMacAddress: deviceForm.bluetoothMacAddress.trim() || null,
        installationDate: deviceForm.installationDate || null,
        firmwareVersion: deviceForm.firmwareVersion.trim() || null,
      }
      if (editingDevice) {
        await deviceAPI.update(editingDevice.deviceId, payload)
      } else {
        await deviceAPI.create(payload)
      }
      setDeviceDialog(false)
      await loadAll()
    } catch (error) {
      console.error('Error saving device:', error)
      alert('Nu s-a putut salva dispozitivul.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDevice = async (d) => {
    const count = sensorsForDevice(d.deviceId).length
    const msg = count > 0
      ? `Dispozitivul #${d.deviceId} are ${count} senzor(i) configurați. Ștergeți senzorii întâi.`
      : `Sigur ștergeți dispozitivul #${d.deviceId}?`
    if (count > 0) { alert(msg); return }
    if (!confirm(msg)) return
    try {
      await deviceAPI.delete(d.deviceId)
      await loadAll()
    } catch (error) {
      console.error('Error deleting device:', error)
      alert('Nu s-a putut șterge dispozitivul.')
    }
  }

  // ===== Sensor CRUD =====
  const openCreateSensor = (deviceId) => {
    setSensorDeviceId(deviceId)
    setEditingSensor(null)
    const nextOrder = sensorsForDevice(deviceId).length + 1
    setSensorForm({ ...EMPTY_SENSOR, orderNumber: nextOrder })
    setSensorDialog(true)
  }

  const openEditSensor = (s) => {
    setSensorDeviceId(s.deviceId)
    setEditingSensor(s)
    setSensorForm({
      name: s.name || '',
      sensorType: s.sensorType || '',
      measurementUnit: s.measurementUnit || '',
      orderNumber: s.orderNumber ?? '',
      samplingPeriodSeconds: s.samplingPeriodSeconds ?? 600,
      scaleFactor: s.scaleFactor ?? 1,
      lowerAlarmThreshold: s.lowerAlarmThreshold ?? '',
      lowerWarningThreshold: s.lowerWarningThreshold ?? '',
      upperWarningThreshold: s.upperWarningThreshold ?? '',
      upperAlarmThreshold: s.upperAlarmThreshold ?? '',
      persistenceSeconds: s.persistenceSeconds ?? '',
      activityGraceSeconds: s.activityGraceSeconds ?? '',
      active: s.active ?? true,
    })
    setSensorDialog(true)
  }

  const applyPreset = (preset) => {
    setSensorForm(f => ({
      ...f,
      name: f.name || preset.sensorType,
      sensorType: preset.sensorType,
      measurementUnit: preset.measurementUnit,
      lowerAlarmThreshold: preset.lowerAlarmThreshold,
      lowerWarningThreshold: preset.lowerWarningThreshold,
      upperWarningThreshold: preset.upperWarningThreshold,
      upperAlarmThreshold: preset.upperAlarmThreshold,
    }))
  }

  const saveSensor = async () => {
    setSubmitting(true)
    try {
      const payload = {
        deviceId: sensorDeviceId,
        orderNumber: num(sensorForm.orderNumber),
        name: sensorForm.name.trim() || null,
        sensorType: sensorForm.sensorType.trim() || null,
        measurementUnit: sensorForm.measurementUnit.trim() || null,
        samplingPeriodSeconds: num(sensorForm.samplingPeriodSeconds),
        scaleFactor: num(sensorForm.scaleFactor),
        lowerAlarmThreshold: num(sensorForm.lowerAlarmThreshold),
        lowerWarningThreshold: num(sensorForm.lowerWarningThreshold),
        upperWarningThreshold: num(sensorForm.upperWarningThreshold),
        upperAlarmThreshold: num(sensorForm.upperAlarmThreshold),
        persistenceSeconds: num(sensorForm.persistenceSeconds),
        activityGraceSeconds: num(sensorForm.activityGraceSeconds),
        active: sensorForm.active,
      }
      if (editingSensor) {
        await sensorConfigAPI.update(editingSensor.sensorId, payload)
      } else {
        await sensorConfigAPI.create(payload)
      }
      setSensorDialog(false)
      await loadAll()
    } catch (error) {
      console.error('Error saving sensor:', error)
      alert('Nu s-a putut salva senzorul.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteSensor = async (s) => {
    if (!confirm(`Sigur ștergeți senzorul "${s.name || s.sensorType}"?`)) return
    try {
      await sensorConfigAPI.delete(s.sensorId)
      await loadAll()
    } catch (error) {
      console.error('Error deleting sensor:', error)
      alert('Nu s-a putut șterge senzorul.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dispozitive</h1>
          <p className="text-slate-500 mt-1">Adăugați dispozitive ESP32, configurați senzorii și atribuiți-le unui pacient</p>
        </div>
        <Button onClick={openCreateDevice}>
          <Plus size={18} />
          Adaugă Dispozitiv
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 max-w-sm">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          placeholder="Căutați după ID, MAC, firmware sau pacient"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Device list */}
      {loading ? (
        <div className="text-center py-14 text-slate-400">Se încarcă...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-slate-400">Niciun dispozitiv. Adăugați primul dispozitiv.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const devSensors = sensorsForDevice(d.deviceId)
            const isOpen = expanded === d.deviceId
            const pName = patientName(d.patientId)
            return (
              <Card key={d.deviceId}>
                <CardBody className="p-0">
                  {/* Device row */}
                  <div className="flex items-center gap-4 p-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                      <Cpu size={20} style={{ color: '#0f4c81' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Dispozitiv #{d.deviceId}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          {d.firmwareVersion ? `ESP32 v${d.firmwareVersion}` : 'ESP32'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {pName || <span className="text-amber-600">Neatribuit</span>}
                        </span>
                        {d.bluetoothMacAddress && <span>MAC: {d.bluetoothMacAddress}</span>}
                        {d.installationDate && <span>Instalat: {d.installationDate.split('T')[0]}</span>}
                        <span className="flex items-center gap-1"><Radio size={12} /> {devSensors.length} senzori</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEditDevice(d)} title="Editează dispozitiv">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteDevice(d)} title="Șterge dispozitiv">
                        <Trash2 size={15} className="text-red-500" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setExpanded(isOpen ? null : d.deviceId)}>
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        Senzori
                      </Button>
                    </div>
                  </div>

                  {/* Sensors panel */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-600">Senzori configurați</h3>
                        <Button size="sm" onClick={() => openCreateSensor(d.deviceId)}>
                          <Plus size={15} /> Adaugă Senzor
                        </Button>
                      </div>
                      {devSensors.length === 0 ? (
                        <div className="text-sm text-slate-400 py-3 flex items-center gap-2">
                          <AlertCircle size={15} /> Niciun senzor configurat pe acest dispozitiv.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {devSensors.map(s => (
                            <Card key={s.sensorId} className="border-slate-200">
                              <CardBody className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 text-sm truncate">{s.name || s.sensorType || 'Senzor'}</div>
                                    <div className="text-xs text-slate-400">{s.sensorType} · #{s.orderNumber ?? '-'}</div>
                                  </div>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                                    style={s.active ? { backgroundColor: '#dcfce7', color: '#16a34a' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                    {s.active ? 'Activ' : 'Inactiv'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 grid grid-cols-2 gap-1">
                                  <span>Prag: {s.lowerAlarmThreshold ?? '–'} … {s.upperAlarmThreshold ?? '–'} {s.measurementUnit}</span>
                                  <span>Eșantion: {s.samplingPeriodSeconds}s</span>
                                </div>
                                <div className="flex justify-end gap-1 pt-1 border-t border-slate-100">
                                  <button onClick={() => openEditSensor(s)} className="text-slate-400 hover:text-slate-700 p-1" title="Editează">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => deleteSensor(s)} className="text-slate-400 hover:text-red-500 p-1" title="Șterge">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Device dialog */}
      <Dialog
        open={deviceDialog}
        onClose={() => setDeviceDialog(false)}
        title={editingDevice ? `Editează Dispozitiv #${editingDevice.deviceId}` : 'Adaugă Dispozitiv'}
      >
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pacient atribuit</label>
            <SearchSelect
              options={patientOptions}
              value={deviceForm.patientId}
              onChange={(v) => setDeviceForm(f => ({ ...f, patientId: v }))}
              placeholder="— Neatribuit —"
              searchPlaceholder="Căutați pacient după nume sau CNP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresă MAC Bluetooth</label>
            <input
              className={inputClass}
              placeholder="Ex: AA:BB:CC:DD:EE:FF"
              maxLength={17}
              value={deviceForm.bluetoothMacAddress}
              onChange={e => setDeviceForm(f => ({ ...f, bluetoothMacAddress: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data instalării</label>
              <input
                type="date"
                className={inputClass}
                value={deviceForm.installationDate}
                onChange={e => setDeviceForm(f => ({ ...f, installationDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Versiune firmware</label>
              <input
                className={inputClass}
                placeholder="Ex: 1.4.2"
                maxLength={20}
                value={deviceForm.firmwareVersion}
                onChange={e => setDeviceForm(f => ({ ...f, firmwareVersion: e.target.value }))}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeviceDialog(false)}>Anulează</Button>
          <Button onClick={saveDevice} disabled={submitting}>
            {submitting ? 'Se salvează...' : editingDevice ? 'Salvează' : 'Adaugă Dispozitiv'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Sensor dialog */}
      <Dialog
        open={sensorDialog}
        onClose={() => setSensorDialog(false)}
        title={editingSensor ? `Editează Senzor` : `Adaugă Senzor · Dispozitiv #${sensorDeviceId}`}
        maxWidth="max-w-2xl"
      >
        <DialogBody className="space-y-4">
          {!editingSensor && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Presetări rapide</label>
              <div className="flex flex-wrap gap-2">
                {SENSOR_PRESETS.map(p => (
                  <button
                    key={p.sensorType}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {p.sensorType}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nume senzor</label>
              <input className={inputClass} placeholder="Ex: Termometru frontal" value={sensorForm.name}
                onChange={e => setSensorForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tip senzor</label>
              <input className={inputClass} placeholder="Ex: Temperatura" value={sensorForm.sensorType}
                onChange={e => setSensorForm(f => ({ ...f, sensorType: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unitate de măsură</label>
              <input className={inputClass} placeholder="Ex: °C" maxLength={10} value={sensorForm.measurementUnit}
                onChange={e => setSensorForm(f => ({ ...f, measurementUnit: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nr. ordine</label>
              <input type="number" className={inputClass} value={sensorForm.orderNumber}
                onChange={e => setSensorForm(f => ({ ...f, orderNumber: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perioadă eșantionare (s)</label>
              <input type="number" className={inputClass} value={sensorForm.samplingPeriodSeconds}
                onChange={e => setSensorForm(f => ({ ...f, samplingPeriodSeconds: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Factor scală</label>
              <input type="number" step="any" className={inputClass} value={sensorForm.scaleFactor}
                onChange={e => setSensorForm(f => ({ ...f, scaleFactor: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Praguri</div>
            <p className="text-xs text-slate-400 mb-2">Intervalul normal este între atenționare inferioară și superioară.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['lowerAlarmThreshold', 'Alarmă inferioară'],
                ['lowerWarningThreshold', 'Atenționare inferioară'],
                ['upperWarningThreshold', 'Atenționare superioară'],
                ['upperAlarmThreshold', 'Alarmă superioară'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                  <input type="number" step="any" className={inputClass} value={sensorForm[key]}
                    onChange={e => setSensorForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Reguli alarmă (Anexa 3)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Durată persistență (s)</label>
                <input type="number" placeholder="ex. 30" className={inputClass} value={sensorForm.persistenceSeconds}
                  onChange={e => setSensorForm(f => ({ ...f, persistenceSeconds: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Toleranță post-activitate (s)</label>
                <input type="number" placeholder="ex. 300" className={inputClass} value={sensorForm.activityGraceSeconds}
                  onChange={e => setSensorForm(f => ({ ...f, activityGraceSeconds: e.target.value }))} />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sensorForm.active}
              onChange={e => setSensorForm(f => ({ ...f, active: e.target.checked }))} />
            Senzor activ
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setSensorDialog(false)}>Anulează</Button>
          <Button onClick={saveSensor} disabled={submitting}>
            {submitting ? 'Se salvează...' : editingSensor ? 'Salvează' : 'Adaugă Senzor'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
