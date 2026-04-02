'use client'

import { formatMoney } from '@/lib/metrics'
import { calculateDividends, getTotalDividendIncome } from '@/lib/dividend'
import type { Portfolio, Trade } from '@/types/finance'

interface DividendTrackerProps {
  portfolios: Portfolio[]
  trades: Trade[]
  exchangeRate: number
}

export default function DividendTracker({ portfolios, trades, exchangeRate }: DividendTrackerProps) {
  const dividends = calculateDividends(portfolios, trades)
  const totalDividends = getTotalDividendIncome(dividends)

  if (!dividends.length) {
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>เงินปันผล</h3>
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>พอร์ตของคุณไม่มี ETF ที่จ่ายเงินปันผล</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>เงินปันผล (คาดการณ์)</h3>
      
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>รายปี</p>
          <p style={{ fontSize: 14, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', fontWeight: 600 }}>
            {formatMoney(totalDividends.annual, 'USD')}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
            {formatMoney(totalDividends.annual * exchangeRate, 'THB')}
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>รายไตรมาส</p>
          <p style={{ fontSize: 14, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', fontWeight: 600 }}>
            {formatMoney(totalDividends.quarterly, 'USD')}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
            {formatMoney(totalDividends.quarterly * exchangeRate, 'THB')}
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>รายเดือน</p>
          <p style={{ fontSize: 14, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)', fontWeight: 600 }}>
            {formatMoney(totalDividends.monthly, 'USD')}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
            {formatMoney(totalDividends.monthly * exchangeRate, 'THB')}
          </p>
        </div>
      </div>

      {/* Dividend Details */}
      <div style={{ fontSize: 11, color: 'var(--text2)' }}>
        <p style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text)' }}>รายละเอียดต่อ ETF:</p>
        {dividends.map(dividend => (
          <div key={dividend.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border2)' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{dividend.symbol}</span>
              <span style={{ marginLeft: 8, color: 'var(--muted)' }}>
                {dividend.quantity.toFixed(3)} หน่วย × {(dividend.annualYield * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>
              <div>{formatMoney(dividend.estimatedAnnualDividend, 'USD')}/ปี</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>
                {formatMoney(dividend.estimatedQuarterlyDividend, 'USD')}/ไตรมาส
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
        <p style={{ fontSize: 10, color: 'var(--accent)', margin: 0 }}>
          💡 เป็นการคาดการณ์จากอัตราเงินปันผลปัจจุบัน อาจแตกต่างจากจริง
        </p>
      </div>
    </div>
  )
}
