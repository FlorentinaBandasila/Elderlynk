import { useState, useEffect, useCallback } from 'react'
import {
  User, Activity, Bell, HeartPulse, Pill, AlertTriangle, Save, Pencil,
  Stethoscope, Calendar, Clock, X,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { TimeSeriesChart, CHART_COLORS } from '@/components/ui/Chart'
import { useAuth } from '@/context/AuthContext'
import {
  patientAPI, alarmAPI, medicalRecommendationAPI, consultationAPI,
} from '@/services/api'
import {
  mapPatientFromAPI, mapAlarmFromAPI, mapConsultationFromAPI, groupMeasurementsBySensor,
} from '@/services/mappers'

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-[#0f4c81]'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('ro-RO') : '-')
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

export default function PatientPortal() {
  const { user } = useAuth()
  const patientId = user?.userId

  const [patient, setPatient]       = useState(null)
  const [allergies, setAllergies]   = useState([])
  const [history, setHistory]       = useState([])
  const [meds, setMeds]             = useState([])
  const [medicalRecs, setMedRecs]   = useState([])
  const [alarms, setAlarms]         = useState([])
  const [consults, setConsults]     = useState([])
  const [sensorGroups, setGroups]   = useState({})
  const [loading, setLoading]       = useState(true)

  // Consultation details modal
  const [selectedConsult, setSelectedConsult] = useState(null)
  const [detailRecs, setDetailRecs] = useState([])
  const [detailMeds, setDetailMeds] = useState([])

  // Editable contact form
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const [p, al, hi, me, mr, alr, ms, co] = await Promise.all([
        patientAPI.getById(patientId).catch(() => null),
        patientAPI.getAllergies(patientId).catch(() => []),
        patientAPI.getHistory(patientId).catch(() => []),
        patientAPI.getMedications(patientId).catch(() => []),
        medicalRecommendationAPI.getByPatientId(patientId).catch(() => []),
        alarmAPI.getAll().catch(() => []),
        patientAPI.getMeasurements(patientId).catch(() => []),
        consultationAPI.getAll().catch(() => []),
      ])
      if (p) {
        const mapped = mapPatientFromAPI(p)
        setPatient(mapped)
        setForm({
          phone: mapped.phone, email: mapped.email, street: mapped.street,
          city: mapped.city, county: mapped.county, postalCode: mapped.postalCode,
          profession: mapped.profession, workplace: mapped.workplace,
          firstName: mapped.firstName, lastName: mapped.lastName, cnp: mapped.cnp,
        })
      }
      setAllergies(al || [])
      setHistory(hi || [])
      setMeds(me || [])
      setMedRecs(mr || [])
      setAlarms((alr || []).map(mapAlarmFromAPI))
      setGroups(groupMeasurementsBySensor(ms || []))
      setConsults(
        (Array.isArray(co) ? co : [])
          .map(mapConsultationFromAPI)
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      )
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await patientAPI.updateSelf(form)
      setEditing(false)
      await load()
    } catch (e) {
      console.error('Eroare la salvarea profilului:', e)
      alert('Nu s-au putut salva modificările.')
    } finally {
      setSaving(false)
    }
  }

  // Open the details modal and load the medical data attached to that consultation.
  const openConsult = async (c) => {
    setSelectedConsult(c)
    setDetailRecs([])
    setDetailMeds([])
    const [recs, meds] = await Promise.all([
      consultationAPI.getRecommendations(c.consultationId).catch(() => []),
      consultationAPI.getMedications(c.consultationId).catch(() => []),
    ])
    setDetailRecs(Array.isArray(recs) ? recs : [])
    setDetailMeds(Array.isArray(meds) ? meds : [])
  }

  const closeConsult = () => {
    setSelectedConsult(null)
    setDetailRecs([])
    setDetailMeds([])
  }

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Se încarcă fișa dvs...</div>
  }

  const tabs = [
    { key: 'profile', label: 'Fișa mea' },
    { key: 'consults', label: 'Consultații', count: consults.length },
    { key: 'recs',    label: 'Recomandări', count: medicalRecs.length },
    { key: 'graphs',  label: 'Evoluție' },
    { key: 'alarms',  label: 'Alarme', count: alarms.length },
  ]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#00b4d8' }}>
          <User size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{patient?.name || 'Fișa mea'}</h1>
          <p className="text-sm text-slate-500">CNP {patient?.cnp || '-'} · {patient?.age ?? '-'} ani</p>
        </div>
      </div>

      <Tabs tabs={tabs}>
        {(active) => (
          <>
            {/* ===== PROFILE ===== */}
            {active === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-slate-800">Date personale</h2>
                      {editing ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Anulează</Button>
                          <Button size="sm" onClick={saveProfile} disabled={saving}>
                            <Save size={14} /> {saving ? 'Se salvează...' : 'Salvează'}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                          <Pencil size={14} /> Editează
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    {!editing ? (
                      <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <Field label="Telefon" value={patient?.phone} />
                        <Field label="Email" value={patient?.email} />
                        <Field label="Stradă" value={patient?.street} />
                        <Field label="Oraș" value={patient?.city} />
                        <Field label="Județ" value={patient?.county} />
                        <Field label="Cod poștal" value={patient?.postalCode} />
                        <Field label="Profesie" value={patient?.profession} />
                        <Field label="Loc de muncă" value={patient?.workplace} />
                      </dl>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['phone', 'Telefon'], ['email', 'Email'], ['street', 'Stradă'],
                          ['city', 'Oraș'], ['county', 'Județ'], ['postalCode', 'Cod poștal'],
                          ['profession', 'Profesie'], ['workplace', 'Loc de muncă'],
                        ].map(([key, label]) => (
                          <label key={key} className="text-sm">
                            <span className="text-slate-500 text-xs">{label}</span>
                            <input
                              className={inputClass}
                              value={form[key] || ''}
                              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><AlertTriangle size={16} /> Alergii</h2></CardHeader>
                  <CardBody>
                    {allergies.length === 0
                      ? <p className="text-sm text-slate-400">Nicio alergie înregistrată.</p>
                      : <div className="flex flex-wrap gap-2">{allergies.map(a => <Badge key={a.allergyId} variant="red">{a.denumire}</Badge>)}</div>}
                  </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><HeartPulse size={16} /> Istoric medical</h2></CardHeader>
                  <CardBody className="p-0">
                    {history.length === 0
                      ? <p className="text-sm text-slate-400 px-5 py-4">Niciun diagnostic înregistrat.</p>
                      : (
                        <ul className="divide-y divide-slate-50">
                          {history.map(h => (
                            <li key={h.historyId} className="px-5 py-3">
                              <div className="font-medium text-sm text-slate-700">{h.diagnostic}</div>
                              {h.tratament && <div className="text-sm text-slate-500">Tratament: {h.tratament}</div>}
                              <div className="text-xs text-slate-400 mt-0.5">{fmtDate(h.dataDiagnostic)}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><Pill size={16} /> Medicație</h2></CardHeader>
                  <CardBody className="p-0">
                    {meds.length === 0
                      ? <p className="text-sm text-slate-400 px-5 py-4">Nicio schemă de medicație.</p>
                      : (
                        <ul className="divide-y divide-slate-50">
                          {meds.map(m => (
                            <li key={m.medicationId} className="px-5 py-3">
                              <div className="font-medium text-sm text-slate-700">{m.denumireMedicament}</div>
                              <div className="text-xs text-slate-500">{m.doza} · {m.frecventaAdministrare}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* ===== CONSULTATIONS ===== */}
            {active === 'consults' && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><Stethoscope size={16} /> Consultații anterioare</h2></CardHeader>
                <CardBody className="p-0">
                  {consults.length === 0
                    ? <p className="text-sm text-slate-400 px-5 py-4">Nicio consultație înregistrată.</p>
                    : (
                      <ul className="divide-y divide-slate-50">
                        {consults.map(c => (
                          <li
                            key={c.id}
                            className="px-5 py-3 hover:bg-slate-50 cursor-pointer"
                            onClick={() => openConsult(c)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-medium text-sm text-slate-700 truncate">{c.presentationReason || c.type}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Medic: {c.doctorName || c.physician || 'Necunoscut'}</div>
                              </div>
                              <div className="flex-shrink-0 text-right text-xs text-slate-400">
                                <div className="flex items-center justify-end gap-1"><Calendar size={12} />{fmtDate(c.date)}</div>
                                <div className="flex items-center justify-end gap-1 mt-0.5"><Clock size={12} />{c.time}</div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                </CardBody>
              </Card>
            )}

            {/* ===== RECOMMENDATIONS ===== */}
            {active === 'recs' && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><Activity size={16} /> Recomandări de la medic</h2></CardHeader>
                <CardBody className="p-0">
                  {medicalRecs.length === 0
                    ? <p className="text-sm text-slate-400 px-5 py-4">Nicio recomandare înregistrată.</p>
                    : (
                      <ul className="divide-y divide-slate-50">
                        {medicalRecs.map(r => (
                          <li key={r.recommendationId} className="px-5 py-3">
                            <div className="font-medium text-sm text-slate-700">{r.tipRecomandare || 'Recomandare'}</div>
                            {r.descriere && <div className="text-sm text-slate-600">{r.descriere}</div>}
                            <div className="text-xs text-slate-400 mt-0.5">{fmtDate(r.dataRecomandarii)}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                </CardBody>
              </Card>
            )}

            {/* ===== GRAPHS ===== */}
            {active === 'graphs' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {Object.keys(sensorGroups).length === 0 && (
                  <Card className="lg:col-span-2"><CardBody><p className="text-sm text-slate-400">Nu există măsurători de senzori înregistrate.</p></CardBody></Card>
                )}
                {Object.entries(sensorGroups).map(([type, g]) => (
                  <Card key={type}>
                    <CardHeader>
                      <h2 className="font-semibold text-slate-800">{type}{g.unit ? ` (${g.unit})` : ''}</h2>
                    </CardHeader>
                    <CardBody>
                      <TimeSeriesChart
                        data={g.data}
                        series={[{ key: 'value', label: type, color: CHART_COLORS.primary }]}
                        unit={g.unit}
                        thresholds={g.thresholds}
                        area
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* ===== ALARMS ===== */}
            {active === 'alarms' && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-800 flex items-center gap-2"><Bell size={16} /> Istoric alarme</h2></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Tip', 'Mesaj', 'Senzor', 'Valoare', 'Stare', 'Data'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alarms.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">Nicio alarmă înregistrată.</td></tr>
                      )}
                      {alarms.map(a => (
                        <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-5 py-3"><Badge variant={a.severity === 'Critical' ? 'red' : 'orange'}>{a.type}</Badge></td>
                          <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{a.message}</td>
                          <td className="px-5 py-3 text-slate-500">{a.sensor}</td>
                          <td className="px-5 py-3 font-semibold text-slate-700">{a.value || '-'}</td>
                          <td className="px-5 py-3"><Badge variant={a.status === 'Resolved' ? 'green' : 'red'}>{a.status === 'Resolved' ? 'Rezolvată' : 'Activă'}</Badge></td>
                          <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{fmtDateTime(a.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </Tabs>

      {/* Consultation details modal */}
      {selectedConsult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={closeConsult}>
          <Card className="w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Detalii consultație</h2>
              <button onClick={closeConsult} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <CardBody className="space-y-4 overflow-y-auto">
              <DetailField label="Medic" value={selectedConsult.doctorName || selectedConsult.physician || 'Necunoscut'} />
              <DetailField label="Motiv prezentare" value={selectedConsult.presentationReason || selectedConsult.type || '-'} />
              {selectedConsult.symptoms && <DetailField label="Simptome" value={selectedConsult.symptoms} />}
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Data" value={fmtDate(selectedConsult.date)} />
                <DetailField label="Ora" value={selectedConsult.time} />
              </div>
              {selectedConsult.diagnosisCode && <DetailField label="Cod diagnostic" value={selectedConsult.diagnosisCode} />}
              {selectedConsult.diagnosticText && <DetailField label="Text diagnostic" value={selectedConsult.diagnosticText} />}
              {selectedConsult.referrals && <DetailField label="Trimiteri" value={selectedConsult.referrals} />}
              {selectedConsult.generatedPrescriptions && <DetailField label="Rețete generate" value={selectedConsult.generatedPrescriptions} />}
              {selectedConsult.notes && <DetailField label="Observații" value={selectedConsult.notes} />}

              {detailRecs.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Recomandări medicale</p>
                  <ul className="mt-1 space-y-1">
                    {detailRecs.map(r => (
                      <li key={r.recommendationId} className="text-sm text-slate-700">
                        <span className="font-medium">{r.tipRecomandare || 'Recomandare'}:</span> {r.descriere}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailMeds.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Scheme de medicație</p>
                  <ul className="mt-1 space-y-1">
                    {detailMeds.map(m => (
                      <li key={m.medicationId} className="text-sm text-slate-700">
                        <span className="font-medium">{m.denumireMedicament}</span> · {m.doza}
                        {[m.frecventaAdministrare, m.durataTratament].filter(Boolean).length > 0 && (
                          <span className="text-slate-500"> — {[m.frecventaAdministrare, m.durataTratament].filter(Boolean).join(' · ')}</span>
                        )}
                        {m.observatiiIngrijitor && <div className="text-xs text-slate-400">{m.observatiiIngrijitor}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase">{label}</p>
      <p className="text-slate-700 mt-1 text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value || '-'}</dd>
    </div>
  )
}
