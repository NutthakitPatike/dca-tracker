'use client'

import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { Portfolio, Trade } from '@/types/finance'
import { calculateTotals, calculatePortfolioMetrics, calculateTradeMetrics, formatMoney } from '@/lib/metrics'
import { exportTransactionsToCSV, exportTradesToCSV, exportPortfolioToCSV, downloadCSV } from '@/lib/export'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import ExportButton from '@/components/ui/ExportButton'
import { SkeletonMetrics, SkeletonChart } from '@/components/ui/Skeleton'

interface Transaction { id: string; type: 'INCOME' | 'EXPENSE'; amount: string | number; category: string; note?: string; date: string }

const symbolColors: Record<string, string> = { SCHG: '#0084C7', SMH: '#1a8a5c', AVUV: '#b8860b', GLDM: '#c43333' }
const getColor = (sym: string) => symbolColors[sym.toUpperCase()] ?? 'var(--accent2)'

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px 24px' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6, color: color ?? 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 14px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
      <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {formatMoney(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardShell() {
  const { rate } = useExchangeRate()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Export functions
  const handleExportFullReport = async () => {
    setIsExporting(true)
    try {
      // Create combined report
      const portfolioCSV = exportPortfolioToCSV(portfolios, trades, rate)
      const tradesCSV = exportTradesToCSV(trades, portfolios, rate)
      const transactionsCSV = exportTransactionsToCSV(transactions, rate)
      
      // Combine all reports
      const combinedCSV = [
        '=== PORTFOLIO REPORT ===',
        portfolioCSV,
        '\n\n=== TRADES REPORT ===',
        tradesCSV,
        '\n\n=== TRANSACTIONS REPORT ===',
        transactionsCSV
      ].join('\n')
      
      const filename = `dca_report_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(combinedCSV, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const loadData = async () => {
    setError(null); setLoading(true)
    try {
      const [txRes, portfolioRes, tradeRes] = await Promise.all([fetch('/api/transactions?page=1&pageSize=50'), fetch('/api/portfolio'), fetch('/api/trades')])
      if ([txRes, portfolioRes, tradeRes].some((r) => r.status === 401)) { setError('กรุณาเข้าสู่ระบบ'); return }
      const [txJson, portfolioJson, tradeJson] = await Promise.all([txRes.json(), portfolioRes.json(), tradeRes.json()])
      setTransactions(txJson.items ?? []); setPortfolios(portfolioJson); setTrades(tradeJson)
    } catch { setError('โหลดข้อมูลไม่ได้') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData().catch(console.error) }, [])

  const totals = useMemo(() => calculateTotals(transactions as any), [transactions])
  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(portfolios, trades), [portfolios, trades])
  const tradeMetrics = useMemo(() => calculateTradeMetrics(portfolios, trades), [portfolios, trades])

  // Build chart data from last 6 months of transactions
  const chartData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {}
    transactions.forEach((tx) => {
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
      if (!months[key]) months[key] = { month: label, income: 0, expense: 0 }
      if (tx.type === 'INCOME') months[key].income += Number(tx.amount)
      else months[key].expense += Number(tx.amount)
    })
    return Object.values(months).slice(-6).reverse()
  }, [transactions])

  const totalPnl = tradeMetrics.reduce((s, m) => s + m.unrealizedPnl, 0)
  const totalCost = tradeMetrics.reduce((s, m) => s + m.totalCost, 0)
  const totalReturnPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>ภาพรวม</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>สรุปการเงินและพอร์ตลงทุนทั้งหมด</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {loading && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>⟳ กำลังโหลด…</span>}
          <ExportButton 
            onExport={handleExportFullReport} 
            filename="Full Report" 
            isLoading={isExporting}
          />
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', marginBottom: 16, fontSize: 13, border: '1px solid var(--red)', background: 'var(--red2)', color: 'var(--red)' }}>{error}</div>}

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <Metric label="รายรับรวม" value={formatMoney(totals.totalIncome)} color="var(--green)" sub={`${transactions.filter(t => t.type === 'INCOME').length} รายการ`} />
        <Metric label="รายจ่ายรวม" value={formatMoney(totals.totalExpense)} color="var(--red)" sub={`${transactions.filter(t => t.type === 'EXPENSE').length} รายการ`} />
        <Metric label="ยอดคงเหลือ" value={formatMoney(totals.netBalance)} color={totals.netBalance >= 0 ? 'var(--green)' : 'var(--red)'} />
        <Metric label="มูลค่าพอร์ต" value={formatMoney(portfolioMetrics.portfolioValue)} color="var(--accent2)" sub={totalCost > 0 ? `P&L: ${totalPnl >= 0 ? '+' : ''}${formatMoney(totalPnl)} (${totalReturnPct.toFixed(2)}%)` : undefined} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Chart */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>รายรับ vs รายจ่าย</p>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 2, background: 'var(--green)', display: 'inline-block' }} />รายรับ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 2, background: 'var(--red)', display: 'inline-block' }} />รายจ่าย</span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="รายรับ" stroke="var(--green)" strokeWidth={2} fill="var(--green2)" dot={false} />
                  <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="var(--red)" strokeWidth={2} fill="var(--red2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูลรายการ</div>
          )}
        </div>

        {/* ETF Snapshot */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ETF Snapshot</p>
            <a href="/invest/dashboard" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>ดูพอร์ต →</a>
          </div>
          {tradeMetrics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {tradeMetrics.map((item, i) => {
                const pos = item.unrealizedPnl >= 0
                const c = getColor(item.symbol)
                return (
                  <div key={item.portfolioId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: i < tradeMetrics.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${c}22`, color: c, minWidth: 48 }}>{item.symbol}</span>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{item.name.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{formatMoney(item.portfolioValue)}</p>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: pos ? 'var(--green)' : 'var(--red)' }}>{pos ? '+' : ''}{item.returnPct.toFixed(2)}%</p>
                    </div>
                  </div>
                )
              })}
              {/* Total P&L */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>รวม P&L</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15, color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {totalPnl >= 0 ? '+' : ''}{formatMoney(totalPnl)}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
              <span style={{ fontSize: 24 }}>�</span>
              <p>ยังไม่มีข้อมูลพอร์ต DCA</p>
              <a href="/invest/dashboard" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>เริ่มลงทุน →</a>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>รายการล่าสุด</p>
          <a href="/finance/transactions" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>ดูทั้งหมด →</a>
        </div>
        {transactions.length === 0 && !loading ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', padding: '16px 0', textAlign: 'center' }}>ยังไม่มีรายการ — <a href="/finance/transactions" style={{ color: 'var(--accent)', textDecoration: 'none' }}>เพิ่มรายการแรก</a></p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['วันที่', 'หมวดหมู่', 'หมายเหตุ', 'ประเภท', 'จำนวนเงิน'].map((h) => (
                  <th key={h} style={{ textAlign: h === 'จำนวนเงิน' ? 'right' : 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 12px 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 8).map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{tx.category}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: tx.type === 'INCOME' ? 'var(--green2)' : 'var(--red2)', color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                      {tx.type === 'INCOME' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.type === 'INCOME' ? '+' : '−'}{formatMoney(Number(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
