'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formatMoney } from '@/lib/metrics'
import { calculateSectorAllocation, getSectorColor } from '@/lib/sector'
import type { Portfolio, Trade } from '@/types/finance'

interface SectorAllocationProps {
  portfolios: Portfolio[]
  trades: Trade[]
  exchangeRate: number
}

export default function SectorAllocation({ portfolios, trades, exchangeRate }: SectorAllocationProps) {
  const sectorData = calculateSectorAllocation(portfolios, trades)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '8px 12px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{data.sector}</p>
        <p style={{ color: 'var(--text)' }}>มูลค่า: {formatMoney(data.value, 'USD')}</p>
        <p style={{ color: 'var(--text2)' }}>THB: {formatMoney(data.value * exchangeRate, 'THB')}</p>
        <p style={{ color: 'var(--muted)' }}>{data.percentage.toFixed(1)}%</p>
      </div>
    )
  }

  if (!sectorData.length) {
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>สัดส่วนตามอุตสาหกรรม</h3>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูลพอร์ต</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>สัดส่วนตามอุตสาหกรรม</h3>
      
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 200, height: 200, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorData.map((entry) => (
                  <Cell key={entry.sector} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sectorData.slice(0, 8).map((sector) => (
            <div key={sector.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 12, height: 3, background: sector.color, borderRadius: 1 }} />
              <span style={{ minWidth: 120, color: 'var(--text2)' }}>{sector.sector}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--text)', fontWeight: 500 }}>
                {formatMoney(sector.value, 'USD')}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                ({sector.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
          {sectorData.length > 8 && (
            <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
              และอีก {sectorData.length - 8} อุตสาหกรรม...
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Sectors Summary */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>อุตสาหกรรมอันดับต้นๆ:</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {sectorData.slice(0, 3).map((sector, index) => (
            <div key={sector.sector} style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>#{index + 1}</span>
                <span style={{ width: 8, height: 2, background: sector.color }} />
              </div>
              <p style={{ fontSize: 10, color: 'var(--text)', margin: 0 }}>{sector.sector}</p>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--accent)', fontWeight: 600, margin: '4px 0 0' }}>
                {sector.percentage.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
