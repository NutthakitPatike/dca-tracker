'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import type { Portfolio } from '@/types/finance'

interface DcaReportProps {
  portfolios: Portfolio[]
  tradeMetrics: Array<{ portfolioId: string; symbol: string; name: string; portfolioValue: number }>
}

const targetWeights: Record<string, number> = {
  SCHG: 0.4,
  SMH: 0.3,
  AVUV: 0.2,
  GLDM: 0.1,
}

const colors = ['#0ea5e9', '#22c55e', '#f97316', '#eab308']

export default function DcaReport({ portfolios, tradeMetrics }: DcaReportProps) {
  const data = tradeMetrics.map((item) => ({
    symbol: item.symbol,
    value: item.portfolioValue,
    target: targetWeights[item.symbol] * 100,
  }))

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">รายงาน DCA</p>
          <h2 className="text-2xl font-semibold text-slate-950">ภาพรวมสัดส่วนพอร์ต</h2>
        </div>
        <p className="text-sm text-slate-500">มูลค่ารวม ${totalValue.toFixed(2)}</p>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">ยังไม่มีข้อมูลพอร์ต DCA</p>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="symbol" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="มูลค่าพอร์ต" radius={[12, 12, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.symbol}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
