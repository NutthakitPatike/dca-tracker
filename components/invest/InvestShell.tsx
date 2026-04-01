'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Portfolio, Trade } from '@/types/finance'
import PortfolioSection from '@/components/dashboard/PortfolioSection'
import DcaAllocation from '@/components/invest/DcaAllocation'
import DcaInvestForm from '@/components/invest/DcaInvestForm'
import DcaReport from '@/components/invest/DcaReport'
import { calculateTradeMetrics } from '@/lib/metrics'

export default function InvestShell() {
  const { status } = useSession()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setError(null); setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([fetch('/api/portfolio'), fetch('/api/trades')])
      if (pRes.status === 401 || tRes.status === 401) { setError('กรุณาเข้าสู่ระบบ'); return }
      const [pJson, tJson] = await Promise.all([pRes.json(), tRes.json()])
      setPortfolios(pJson); setTrades(tJson)
    } catch { setError('โหลดข้อมูลไม่ได้') }
    finally { setLoading(false) }
  }

  const refreshPrices = async () => {
    await fetch('/api/portfolio/refresh', { method: 'POST' })
    await loadData()
  }

  useEffect(() => {
    if (status === 'authenticated') refreshPrices().catch(console.error)
  }, [status])

  const tradeMetrics = calculateTradeMetrics(portfolios, trades)

  return (
    <div>
      {error && (
        <div style={{ borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 13, border: '1px solid', background: 'var(--red2)', borderColor: 'rgba(248,113,113,0.25)', color: 'var(--red)' }}>{error}</div>
      )}
      <DcaAllocation />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '16px 0' }}>
        <DcaInvestForm onSuccess={loadData} />
        <DcaReport portfolios={portfolios} tradeMetrics={tradeMetrics} />
      </div>
      <PortfolioSection portfolios={portfolios} trades={trades} tradeMetrics={tradeMetrics} onReload={loadData} loading={loading} />
    </div>
  )
}
