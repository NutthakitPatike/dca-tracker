import { formatMoney } from '@/lib/metrics'

interface SimpleChartProps {
  label: string
  primary: number
  secondary: number
}

export default function SimpleChart({ label, primary, secondary }: SimpleChartProps) {
  const primaryPercent = primary + secondary === 0 ? 50 : Math.round((primary / (primary + secondary)) * 100)
  const secondaryPercent = 100 - primaryPercent

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <div className="text-xs text-slate-500">หลัก / รอง</div>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <div className="text-xs uppercase text-slate-500">หลัก</div>
          <p className="mt-1 text-xl font-semibold text-slate-950">{formatMoney(primary)}</p>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-500">รอง</div>
          <p className="mt-1 text-xl font-semibold text-slate-950">{formatMoney(secondary)}</p>
        </div>
        <div className="rounded-full bg-slate-100 p-1">
          <div className="flex overflow-hidden rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${primaryPercent}%`, minWidth: '4px', height: '12px' }} />
          <div className="h-3 rounded-full bg-slate-300" style={{ width: `${secondaryPercent}%` }} />
        </div>
      </div>
    </div>
  )
}
