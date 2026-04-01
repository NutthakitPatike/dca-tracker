'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import type { Portfolio, Trade } from '@/types/finance'
import PortfolioSection from '@/components/dashboard/PortfolioSection'
import DcaAllocation from '@/components/invest/DcaAllocation'
import DcaInvestForm from '@/components/invest/DcaInvestForm'
import DcaReport from '@/components/invest/DcaReport'
import { calculateTradeMetrics } from '@/lib/metrics'

export default function InvestShell() {
  const { data: session, status } = useSession()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setError(null)
    setLoading(true)

    try {
      const [portfolioRes, tradeRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/trades'),
      ])
      if (portfolioRes.status === 401 || tradeRes.status === 401) {
        setError('กรุณาเข้าสู่ระบบก่อนดูข้อมูล')
        setPortfolios([])
        setTrades([])
        return
      }
      const [portfolioJson, tradeJson] = await Promise.all([portfolioRes.json(), tradeRes.json()])
      setPortfolios(portfolioJson)
      setTrades(tradeJson)
    } catch {
      setError('ไม่สามารถโหลดข้อมูลพอร์ตได้ในขณะนี้')
    } finally {
      setLoading(false)
    }
  }

  const refreshPrices = async () => {
    await fetch('/api/portfolio/refresh', { method: 'POST' })
    await loadData()
  }

  useEffect(() => {
    if (status === 'authenticated') {
      refreshPrices().catch(console.error)
    }
  }, [status])

  if (status === 'loading') {
    return <div className="rounded-3xl bg-white p-8 shadow-panel">กำลังโหลด...</div>
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-950">กรุณาเข้าสู่ระบบ</h2>
        <p className="mt-2 text-slate-500">ลงชื่อเข้าใช้เพื่อจัดการพอร์ตลงทุน DCA ของคุณ</p>
        <button
          className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={() => signIn()}
        >
          เข้าสู่ระบบ
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DcaAllocation />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DcaInvestForm onSuccess={loadData} />
        <DcaReport portfolios={portfolios} tradeMetrics={calculateTradeMetrics(portfolios, trades)} />
      </div>
      <PortfolioSection
        portfolios={portfolios}
        trades={trades}
        tradeMetrics={calculateTradeMetrics(portfolios, trades)}
        onReload={loadData}
        loading={loading}
      />
    </div>
  )
}
