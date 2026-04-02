'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Portfolio, Trade } from '@/types/finance'
import { calculateTradeMetrics } from '@/lib/metrics'
import DcaReport from './DcaReport'
import { SkeletonChart } from '@/components/ui/Skeleton'

export default function DcaReportShell() {
  const { status } = useSession()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([fetch('/api/portfolio'), fetch('/api/trades')])
      .then(async ([pRes, tRes]) => {
        if (pRes.ok && tRes.ok) {
          setPortfolios(await pRes.json())
          setTrades(await tRes.json())
        }
      })
      .finally(() => setLoading(false))
  }, [status])

  const tradeMetrics = calculateTradeMetrics(portfolios, trades)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>รายงาน DCA</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>เปรียบเทียบสัดส่วนจริงกับเป้าหมาย allocation</p>
      </div>

      {loading ? <SkeletonChart /> : (
        <DcaReport portfolios={portfolios} tradeMetrics={tradeMetrics} />
      )}

      {/* Trade history */}
      {!loading && trades.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 16 }}>ประวัติ Trade ล่าสุด</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  {['วันที่', 'ETF', 'จำนวน', 'ราคา/หน่วย', 'มูลค่า'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 10px 10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 50).map((trade) => {
                  const portfolio = portfolios.find((p) => p.id === trade.portfolioId)
                  return (
                    <tr key={trade.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>{new Date(trade.date).toLocaleDateString('th-TH')}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: 'rgba(99,102,241,0.12)', color: 'var(--accent2)' }}>
                          {portfolio?.symbol ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text2)' }}>{Number(trade.quantity).toFixed(4)}</td>
                      <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text2)' }}>${Number(trade.price).toFixed(2)}</td>
                      <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>${Number(trade.amount).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
