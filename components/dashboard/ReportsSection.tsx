import type { Portfolio, Transaction } from '@/types/finance'
import { calculatePortfolioMetrics, calculateTotals } from '@/lib/metrics'

interface ReportsSectionProps {
  transactions: Transaction[]
  portfolios: Portfolio[]
}

export default function ReportsSection({ transactions, portfolios }: ReportsSectionProps) {
  const totals = calculateTotals(transactions)
  const portfolioMetrics = calculatePortfolioMetrics(portfolios, [])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">รายงานการเงิน</h3>
          <p className="mt-1 text-sm text-slate-500">ภาพรวมธุรกรรมและพอร์ตการลงทุนของคุณ</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          ล่าสุด
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">รายรับทั้งหมด</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">${totals.totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">รายจ่ายทั้งหมด</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">${totals.totalExpense.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ยอดคงเหลือสุทธิ</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">${totals.netBalance.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">มูลค่าพอร์ต</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">${portfolioMetrics.portfolioValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
