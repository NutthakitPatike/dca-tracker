'use client'

import { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import type { Portfolio, Transaction, Trade } from '@/types/finance'
import { calculateTotals, calculatePortfolioMetrics, calculateTradeMetrics } from '@/lib/metrics'
import SummaryCards from './SummaryCards'
import PortfolioSection from './PortfolioSection'
import TransactionsSection from './TransactionsSection'
import SimpleChart from './SimpleChart'
import ReportsSection from './ReportsSection'

export default function DashboardShell() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const [txRes, portfolioRes, tradeRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/portfolio'),
        fetch('/api/trades'),
      ])

      if (txRes.status === 401 || portfolioRes.status === 401 || tradeRes.status === 401) {
        setError('กรุณาเข้าสู่ระบบก่อนใช้งาน')
        setTransactions([])
        setPortfolios([])
        setTrades([])
        return
      }

      const [txJson, portfolioJson, tradeJson] = await Promise.all([
        txRes.json(),
        portfolioRes.json(),
        tradeRes.json(),
      ])

      setTransactions(txJson)
      setPortfolios(portfolioJson)
      setTrades(tradeJson)
    } catch (fetchError) {
      console.error(fetchError)
      setError('ไม่สามารถโหลดข้อมูลได้ในขณะนี้')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadData().catch(console.error)
    }
  }, [status])

  const totals = useMemo(() => calculateTotals(transactions), [transactions])
  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(portfolios, trades), [portfolios, trades])
  const tradeMetrics = useMemo(() => calculateTradeMetrics(portfolios, trades), [portfolios, trades])

  if (status === 'loading') {
    return <div className="rounded-3xl bg-white p-8 shadow-panel">กำลังโหลด...</div>
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-950">กรุณาเข้าสู่ระบบ</h2>
        <p className="mt-2 text-slate-500">คุณต้องเข้าสู่ระบบก่อนเพื่อดูแดชบอร์ดและข้อมูลส่วนตัวของคุณ</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => signIn()}
          >
            เข้าสู่ระบบ
          </button>
          <button
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            onClick={() => window.location.href = '/auth/signup'}
          >
            สมัครสมาชิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">ยินดีต้อนรับ, {session.user?.name ?? session.user?.email}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">แดชบอร์ดส่วนตัว</h2>
        </div>
        <button
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          ออกจากระบบ
        </button>
      </div>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <SummaryCards
        totalIncome={totals.totalIncome}
        totalExpense={totals.totalExpense}
        netBalance={totals.netBalance}
        portfolioValue={portfolioMetrics.portfolioValue}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <TransactionsSection transactions={transactions} onReload={loadData} loading={isLoading} />
        </div>

        <div className="space-y-6">
          <PortfolioSection
            portfolios={portfolios}
            trades={trades}
            tradeMetrics={tradeMetrics}
            onReload={loadData}
            loading={isLoading}
          />
        </div>
      </div>

      <ReportsSection transactions={transactions} portfolios={portfolios} />

      <div className="grid gap-6 md:grid-cols-2">
        <SimpleChart label="รายรับ vs รายจ่าย" primary={totals.totalIncome} secondary={totals.totalExpense} />
        <SimpleChart label="มูลค่าพอร์ต" primary={portfolioMetrics.portfolioValue} secondary={totals.netBalance} />
      </div>
    </section>
  )
}
