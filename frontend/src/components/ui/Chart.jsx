import {
  ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ReferenceArea,
} from 'recharts'

// Shared palette (matches the app's cyan/blue accents).
export const CHART_COLORS = {
  primary: '#00b4d8',
  accent: '#0f4c81',
  green: '#16a34a',
  amber: '#f59e0b',
  red: '#e63946',
  slate: '#94a3b8',
}

const axisProps = {
  tick: { fontSize: 11, fill: '#94a3b8' },
  axisLine: { stroke: '#e2e8f0' },
  tickLine: false,
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      {label !== undefined && <div className="font-semibold text-slate-700 mb-1">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Time-series line/area chart.
 *
 * @param {object[]} data        Array of points.
 * @param {string}   xKey        Key for the X axis (e.g. 'time').
 * @param {Array}    series      [{ key, label, color }] one entry per plotted line.
 * @param {string}   unit        Optional unit appended in the tooltip.
 * @param {object}   thresholds  Optional { lowAlarm, lowWarn, highWarn, highAlarm } reference lines.
 * @param {boolean}  area        Render filled areas instead of plain lines.
 * @param {number}   height      Chart height in px (default 260).
 */
export function TimeSeriesChart({
  data = [],
  xKey = 'time',
  series = [{ key: 'value', label: 'Valoare', color: CHART_COLORS.primary }],
  unit,
  thresholds,
  area = false,
  height = 260,
}) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg"
        style={{ height }}
      >
        Nu există date pentru afișare
      </div>
    )
  }

  const Chart = area ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}

        {/* Threshold bands / lines */}
        {thresholds?.highAlarm != null && (
          <ReferenceLine y={thresholds.highAlarm} stroke={CHART_COLORS.red} strokeDasharray="4 4" />
        )}
        {thresholds?.highWarn != null && (
          <ReferenceLine y={thresholds.highWarn} stroke={CHART_COLORS.amber} strokeDasharray="4 4" />
        )}
        {thresholds?.lowWarn != null && (
          <ReferenceLine y={thresholds.lowWarn} stroke={CHART_COLORS.amber} strokeDasharray="4 4" />
        )}
        {thresholds?.lowAlarm != null && (
          <ReferenceLine y={thresholds.lowAlarm} stroke={CHART_COLORS.red} strokeDasharray="4 4" />
        )}

        {series.map((s) =>
          area ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ),
        )}
      </Chart>
    </ResponsiveContainer>
  )
}

/**
 * Simple categorical bar chart, used by reports/statistics.
 */
export function BarChartSimple({
  data = [],
  xKey = 'label',
  barKey = 'value',
  barLabel = 'Valoare',
  color = CHART_COLORS.accent,
  unit,
  height = 260,
}) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg"
        style={{ height }}
      >
        Nu există date pentru afișare
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        <Bar dataKey={barKey} name={barLabel} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export { ReferenceArea }
