'use client'

import { formatMoney } from '@/lib/metrics'
import { calculatePortfolioComparison, getMarketIndices, getPerformanceRating } from '@/lib/marketComparison'
import type { Portfolio, Trade } from '@/types/finance'

interface MarketComparisonProps {
  portfolios: Portfolio[]
  trades: Trade[]
  exchangeRate: number
}

export default function MarketComparison({ portfolios, trades, exchangeRate }: MarketComparisonProps) {
  const comparison = calculatePortfolioComparison(portfolios, trades)
  const marketIndices = getMarketIndices()
  const performanceRating = getPerformanceRating(comparison.portfolioReturn)

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>เปรียบเทียบกับดัชนีตลาด</h3>
      
      {/* Performance Rating */}
      <div style={{ 
        padding: '12px', 
        background: `${performanceRating.color}22`, 
        border: `1px solid ${performanceRating.color}`, 
        borderRadius: 'var(--radius)', 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: performanceRating.color, marginBottom: 4 }}>
          {performanceRating.rating}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)' }}>
          {performanceRating.description}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          {comparison.portfolioName}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 10 }}>
          <div>
            <span style={{ color: 'var(--muted)' }}>มูลค่า: </span>
            <span style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace" }}>
              {formatMoney(comparison.portfolioValue, 'USD')}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>ผลตอบแทน: </span>
            <span style={{ color: comparison.portfolioReturn >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: "'JetBrains Mono',monospace" }}>
              {comparison.portfolioReturn >= 0 ? '+' : ''}{comparison.portfolioReturn.toFixed(2)}%
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>ประจำปี: </span>
            <span style={{ color: comparison.portfolioAnnualized >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: "'JetBrains Mono',monospace" }}>
              {comparison.portfolioAnnualized >= 0 ? '+' : ''}{comparison.portfolioAnnualized.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>เปรียบเทียบผลตอบแทน 1 ปี:</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>ดัชนี</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>ผลตอบแทน</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>พอร์ต vs ตลาด</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>อันดับ</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border2)' }}>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text)' }}>
                {comparison.portfolioName}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: comparison.portfolioReturn >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {comparison.portfolioReturn >= 0 ? '+' : ''}{comparison.portfolioReturn.toFixed(2)}%
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>
                —
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                <span style={{ 
                  padding: '2px 6px', 
                  borderRadius: 3, 
                  fontSize: 9, 
                  fontWeight: 600,
                  background: 'var(--accent)',
                  color: '#fff'
                }}>
                  1
                </span>
              </td>
            </tr>
            {Object.entries(comparison.benchmarks).map(([indexName, data]) => (
              <tr key={indexName} style={{ borderBottom: '1px solid var(--border2)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>
                  {indexName}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: data.return >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {data.return >= 0 ? '+' : ''}{data.return.toFixed(2)}%
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>
                  <span style={{ color: data.outperformance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {data.outperformance >= 0 ? '+' : ''}{data.outperformance.toFixed(2)}%
                  </span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: 3, 
                    fontSize: 9, 
                    fontWeight: 600,
                    background: comparison.ranking[indexName] === 1 ? 'var(--green)' : 'var(--muted)',
                    color: '#fff'
                  }}>
                    {comparison.ranking[indexName]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Market Indices Info */}
      <div style={{ marginTop: 16, fontSize: 10, color: 'var(--text2)' }}>
        <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text)' }}>ข้อมูลดัชนีตลาด:</div>
        {marketIndices.map(index => (
          <div key={index.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>{index.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>
              1Y: {index.oneYearReturn >= 0 ? '+' : ''}{index.oneYearReturn.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
        <p style={{ fontSize: 10, color: 'var(--accent)', margin: 0 }}>
          📊 การเปรียบเทียบใช้ข้อมูลจำลอง ผลลัพธ์จริงอาจแตกต่าง
        </p>
      </div>
    </div>
  )
}
