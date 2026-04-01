'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Portfolio, Trade } from '@/types/finance'
import { calculateTotals, calculatePortfolioMetrics, calculateTradeMetrics } from '@/lib/metrics'
import SummaryCards from './SummaryCards'
import PortfolioSection from './PortfolioSection'
import TransactionsSection from './TransactionsSection'

interface Transaction { id: string; type: 'INCOME' | 'EXPENSE'; amount: string | number; category: string; note?: string; date: string }

export default function DashboardShell() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setError(null); setIsLoading(true)
    try {
      const [txRes, portfolioRes, tradeRes] = await Promise.all([fetch('/api/transactions?page=1&pageSize=20'), fetch('/api/portfolio'), fetch('/api/trades')])
      if (txRes.status === 401 || portfolioRes.status === 401 || tradeRes.status === 401) { setError('กรุณาเข้าสู่ระบบ'); return }
      const [txJson, portfolioJson, tradeJson] = await Promise.all([txRes.json(), portfolioRes.json(), tradeRes.json()])
      setTransactions(txJson.items ?? []); setPortfolios(portfolioJson); setTrades(tradeJson)
    } catch { setError('ไม่สามารถโหลดข้อมูลได้') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { loadData().catch(console.error) }, [])

  const totals = useMemo(() => calculateTotals(transactions as any), [transactions])
  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(portfolios, trades), [portfolios, trades])
  const tradeMetrics = useMemo(() => calculateTradeMetrics(portfolios, trades), [portfolios, trades])

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>ภาพรวม</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>สรุปการเงินและพอร์ตลงทุนทั้งหมด</p>
      </div>

      {error && (
        <div style={{ borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 13, border: '1px solid', background: 'var(--red2)', borderColor: 'rgba(248,113,113,0.25)', color: 'var(--red)' }}>{error}</div>
      )}

      <SummaryCards
        totalIncome={totals.totalIncome}
        totalExpense={totals.totalExpense}
        netBalance={totals.netBalance}
        portfolioValue={portfolioMetrics.portfolioValue}
      />

      {/* Quick snapshot */}
      {tradeMetrics.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 16 }}>ETF Snapshot</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tradeMetrics.map((item) => {
              const pos = item.unrealizedPnl >= 0
              const colors: Record<string, string> = { SCHG: '#38bdf8', SMH: '#818cf8', AVUV: '#22d3a0', GLDM: '#fbbf24' }
              const c = colors[item.symbol.toUpperCase()] ?? 'var(--accent2)'
              return (
                <div key={item.portfolioId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${c}22`, color: c }}>{item.symbol}</span>
                    <strong style={{ fontSize: 14, color: 'var(--text)' }}>{item.name}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--text)' }}>{(item.portfolioValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: pos ? 'var(--green)' : 'var(--red)' }}>{pos ? '+' : ''}{item.returnPct.toFixed(2)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent transactions preview */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px' }}>รายการล่าสุด</p>
          <a href="/finance/transactions" style={{ fontSize: 12, color: 'var(--accent2)', textDecoration: 'none' }}>ดูทั้งหมด →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {transactions.slice(0, 5).map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{tx.category}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                  {tx.type === 'INCOME' ? '+' : '−'}{Number(tx.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && !isLoading && (
              <tr><td colSpan={3} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--muted)' }}>ยังไม่มีรายการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
