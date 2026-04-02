'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { Portfolio } from '@/types/finance'

interface Props {
  portfolios: Portfolio[]
  tradeMetrics: Array<{ portfolioId: string; symbol: string; name: string; portfolioValue: number }>
}

const symbolColors: Record<string, string> = { SCHG: '#38bdf8', SMH: '#818cf8', AVUV: '#22d3a0', GLDM: '#fbbf24' }
const targetWeights: Record<string, number> = { SCHG: 0.4, SMH: 0.3, AVUV: 0.2, GLDM: 0.1 }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface3)', border: '1px solid var(--border3)', borderRadius: 8, padding: '10px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text)' }}>
      <p style={{ fontWeight: 600 }}>{payload[0]?.payload?.symbol}</p>
      <p style={{ color: 'var(--text2)', marginTop: 4 }}>${Number(payload[0]?.value ?? 0).toFixed(2)}</p>
    </div>
  )
}

export default function DcaReport({ portfolios, tradeMetrics }: Props) {
  const data = tradeMetrics.map((item) => ({
    symbol: item.symbol,
    value: item.portfolioValue,
    target: (targetWeights[item.symbol] ?? 0) * 100,
    color: symbolColors[item.symbol.toUpperCase()] ?? '#818cf8',
  }))

  const totalValue = data.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 4 }}>รายงาน DCA</p>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>ภาพรวมสัดส่วนพอร์ต</h2>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text2)' }}>
          ${totalValue.toFixed(2)}
        </span>
      </div>

      {data.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', paddingTop: 16 }}>ยังไม่มีข้อมูลพอร์ต DCA</p>
      ) : (
        <>
          <div style={{ position: 'relative', width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="symbol" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.symbol} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            {data.map((item) => {
              const actual = totalValue > 0 ? (item.value / totalValue) * 100 : 0
              const drift = actual - item.target
              return (
                <div key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace" }}>{item.symbol}</span>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', minWidth: 44, textAlign: 'right' }}>{item.target.toFixed(0)}% target</span>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", minWidth: 56, textAlign: 'right', color: Math.abs(drift) < 2 ? 'var(--green)' : 'var(--amber)' }}>
                    {drift >= 0 ? '+' : ''}{drift.toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
