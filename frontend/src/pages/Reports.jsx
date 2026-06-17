import { useState, useEffect } from 'react'
import { Users, Bell, CheckCircle, Stethoscope, Activity, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { TimeSeriesChart, BarChartSimple, CHART_COLORS } from '@/components/ui/Chart'
import { reportAPI } from '@/services/api'

const statCards = [
  { key: 'totalPatients',       label: 'Pacienți',       icon: Users,       color: '#0f4c81', bg: '#dbeafe' },
  { key: 'activeAlarms',        label: 'Alarme active',  icon: Bell,        color: '#b91c1c', bg: '#fee2e2' },
  { key: 'resolvedAlarms',      label: 'Alarme rezolvate', icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
  { key: 'totalConsultations',  label: 'Consultații',    icon: Stethoscope, color: '#0e7490', bg: '#cffafe' },
  { key: 'totalMeasurements',   label: 'Măsurători',     icon: Activity,    color: '#d97706', bg: '#fef9c3' },
]

export default function Reports() {
  const [data, setData]     = useState(null)
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let active = true
    reportAPI.getOverview()
      .then(d => { if (active) setData(d) })
      .catch(e => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoad(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="p-6 text-slate-400 text-sm">Se generează raportul...</div>
  if (error)   return <div className="p-6 text-red-500 text-sm">Eroare la încărcarea raportului: {error}</div>
  if (!data)   return null

  // Merge alarms + consultations monthly series into one chart dataset.
  const monthly = (data.alarmsByMonth || []).map((p, i) => ({
    time: p.label,
    alarme: p.value,
    consultatii: data.consultationsByMonth?.[i]?.value ?? 0,
  }))

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 size={22} style={{ color: '#0f4c81' }} /> Rapoarte & Statistici
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Sinteză a datelor monitorizate, în limita pacienților dvs.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <Card key={s.key}>
            <CardBody className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{data[s.key] ?? 0}</div>
                <div className="text-xs font-medium text-slate-500">{s.label}</div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Monthly trends */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-800">Evoluție lunară (ultimele 6 luni)</h2></CardHeader>
        <CardBody>
          <TimeSeriesChart
            data={monthly}
            xKey="time"
            series={[
              { key: 'alarme', label: 'Alarme', color: CHART_COLORS.red },
              { key: 'consultatii', label: 'Consultații', color: CHART_COLORS.accent },
            ]}
            height={280}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Alarme după tip</h2></CardHeader>
          <CardBody>
            <BarChartSimple data={data.alarmsByType} xKey="label" barKey="value" barLabel="Alarme" color={CHART_COLORS.red} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-800">Media valorilor pe tip de senzor</h2></CardHeader>
          <CardBody>
            <BarChartSimple data={data.avgMeasurementBySensorType} xKey="label" barKey="value" barLabel="Medie" color={CHART_COLORS.primary} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><h2 className="font-semibold text-slate-800">Top diagnostice</h2></CardHeader>
          <CardBody>
            {(!data.topDiagnoses || data.topDiagnoses.length === 0) ? (
              <p className="text-sm text-slate-400">Nu există date de diagnostic.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Diagnostic / Cod ICD</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Cazuri</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDiagnoses.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-3 py-2 text-slate-700">{d.label}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-800">{d.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
