'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/metrics'
import { calculateWhatIfScenarios, calculateGoalProjection } from '@/lib/whatif'
import type { Portfolio, Trade } from '@/types/finance'

interface WhatIfAnalysisProps {
  portfolios: Portfolio[]
  trades: Trade[]
  exchangeRate: number
}

export default function WhatIfAnalysis({ portfolios, trades, exchangeRate }: WhatIfAnalysisProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(500)
  const [expectedReturn, setExpectedReturn] = useState(8)
  const [years, setYears] = useState(10)
  const [goalAmount, setGoalAmount] = useState(100000)

  const scenarios = calculateWhatIfScenarios({
    currentPortfolio: portfolios,
    trades,
    monthlyInvestment,
    expectedReturn,
    years
  })

  const goalProjection = calculateGoalProjection(
    portfolios.reduce((sum, p) => {
      const portfolioTrades = trades.filter(t => t.portfolioId === p.id)
      const quantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
      return sum + (quantity * Number(p.currentPrice))
    }, 0),
    goalAmount,
    monthlyInvestment,
    expectedReturn
  )

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>What-If Analysis</h3>
      
      {/* Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ลงทุนต่อเดือน (USD)</label>
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            min="0"
            step="100"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace"
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ผลตอบแทนคาดหวัง (%)</label>
          <input
            type="number"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            min="0"
            max="30"
            step="1"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace"
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ระยะเวลา (ปี)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min="1"
            max="30"
            step="1"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace"
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>เป้าหมาย (USD)</label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            min="1000"
            step="10000"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace"
            }}
          />
        </div>
      </div>

      {/* Goal Projection */}
      <div style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>การคำนวณเป้าหมาย</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
          <span style={{ color: 'var(--text2)' }}>เป้าหมาย {formatMoney(goalAmount, 'USD')}:</span>
          <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>
            {goalProjection.achievable ? (
              <div>
                <div style={{ color: 'var(--green)', fontWeight: 600 }}>
                  บรรลุใน {goalProjection.yearsRequired.toFixed(1)} ปี
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 10 }}>
                  ({goalProjection.monthsRequired} เดือน)
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--amber)', fontWeight: 600 }}>
                ไม่สามารถบรรลุใน 50 ปี
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12 }}>สถานการณ์จำลอง:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map((scenario, index) => (
          <div key={scenario.name} style={{ 
            padding: '12px', 
            background: index === 0 ? 'var(--accent-light)' : 'var(--surface)', 
            border: index === 0 ? '1px solid var(--accent)' : '1px solid var(--border)', 
            borderRadius: 'var(--radius)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  {scenario.name}
                  {index === 0 && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)' }}>แนะนำ</span>}
                </h4>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
                  {scenario.description}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>
                  {formatMoney(scenario.finalValue, 'USD')}
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 10 }}>
                  {formatMoney(scenario.finalValue * exchangeRate, 'THB')}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 10 }}>
              <div>
                <span style={{ color: 'var(--muted)' }}>ลงทุนทั้งหมด: </span>
                <span style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {formatMoney(scenario.totalInvested, 'USD')}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>กำไร: </span>
                <span style={{ color: scenario.totalReturn >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {scenario.totalReturn >= 0 ? '+' : ''}{formatMoney(scenario.totalReturn, 'USD')}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>ผลตอบแทน: </span>
                <span style={{ color: scenario.returnPercentage >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {scenario.returnPercentage >= 0 ? '+' : ''}{scenario.returnPercentage.toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>ระยะเวลา: </span>
                <span style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {scenario.years} ปี
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
        <p style={{ fontSize: 10, color: 'var(--accent)', margin: 0 }}>
          💡 การคำนวนใช้สมมติฐานผลตอบแทนคงที่ ผลลัพธ์จริงอาจแตกต่าง
        </p>
      </div>
    </div>
  )
}
