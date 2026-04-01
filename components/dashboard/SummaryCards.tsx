import { formatMoney } from '@/lib/metrics'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
  netBalance: number
  portfolioValue: number
}

const cardStyles = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'

export default function SummaryCards({ totalIncome, totalExpense, netBalance, portfolioValue }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={cardStyles}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">รายรับรวม</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">{formatMoney(totalIncome)}</p>
      </div>
      <div className={cardStyles}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">รายจ่ายรวม</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">{formatMoney(totalExpense)}</p>
      </div>
      <div className={cardStyles}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ยอดคงเหลือ</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">{formatMoney(netBalance)}</p>
      </div>
      <div className={cardStyles}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">มูลค่าพอร์ต</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">{formatMoney(portfolioValue)}</p>
      </div>
    </div>
  )
}
