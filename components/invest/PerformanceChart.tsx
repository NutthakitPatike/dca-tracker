'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatMoney } from '@/lib/metrics'
import type { Portfolio, Trade } from '@/types/finance'
import { usePortfolioPerformance } from '@/hooks/usePortfolioPerformance'

interface PerformanceChartProps {
  portfolios: Portfolio[]
  trades: Trade[]
  exchangeRate: number
}

export default function PerformanceChart({ portfolios, trades, exchangeRate }: PerformanceChartProps) {
  const { performanceData, totalReturn, annualizedReturn, bestDay, worstDay } = usePortfolioPerformance(portfolios, trades)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 14px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
        <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{new Date(data.date).toLocaleDateString('th-TH')}</p>
        <p style={{ color: 'var(--text)' }}>มูลค่า: {formatMoney(data.value, 'USD')}</p>
        <p style={{ color: 'var(--text2)' }}>ต้นทุน: {formatMoney(data.cost, 'USD')}</p>
        <p style={{ color: data.pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
          P&L: {data.pnl >= 0 ? '+' : ''}{formatMoney(data.pnl, 'USD')} ({data.returnPct.toFixed(2)}%)
        </p>
      </div>
    )
  }

  if (!performanceData.length) {
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูลประสิทธิภาพพอร์ต</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>ประสิทธิภาพพอร์ต</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--muted)' }}>Total Return: </span>
            <span style={{ color: totalReturn.value >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {totalReturn.value >= 0 ? '+' : ''}{formatMoney(totalReturn.value, 'USD')} ({totalReturn.percent.toFixed(2)}%)
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Annualized: </span>
            <span style={{ color: annualizedReturn >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {annualizedReturn >= 0 ? '+' : ''}{annualizedReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--muted)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--muted)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#colorValue)" />
            <Area type="monotone" dataKey="cost" stroke="var(--muted)" strokeWidth={1} fill="url(#colorCost)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Best Day</p>
          <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', fontWeight: 600 }}>
            {bestDay ? `+${formatMoney(bestDay.pnl, 'USD')}` : 'N/A'}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Worst Day</p>
          <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--red)', fontWeight: 600 }}>
            {worstDay ? formatMoney(worstDay.pnl, 'USD') : 'N/A'}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Days Tracked</p>
          <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--text)', fontWeight: 600 }}>
            {totalReturn.days}
          </p>
        </div>
      </div>
    </div>
  )
}
