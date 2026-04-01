import { formatMoney } from '@/lib/metrics'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
  netBalance: number
  portfolioValue: number
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border3)')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: 'radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent 70%)', pointerEvents: 'none' }} />
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 6, color: color ?? 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

export default function SummaryCards({ totalIncome, totalExpense, netBalance, portfolioValue }: SummaryCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
      <Metric label="รายรับรวม" value={formatMoney(totalIncome)} color="var(--green)" />
      <Metric label="รายจ่ายรวม" value={formatMoney(totalExpense)} color="var(--red)" />
      <Metric label="ยอดคงเหลือ" value={formatMoney(netBalance)} color={netBalance >= 0 ? 'var(--green)' : 'var(--red)'} />
      <Metric label="มูลค่าพอร์ต" value={formatMoney(portfolioValue)} color="var(--accent2)" />
    </div>
  )
}
