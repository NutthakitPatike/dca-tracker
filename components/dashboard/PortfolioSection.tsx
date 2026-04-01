'use client'

import { useEffect, useState } from 'react'
import type { Portfolio, Trade } from '@/types/finance'
import { formatMoney } from '@/lib/metrics'

interface TradeMetric {
  portfolioId: string; symbol: string; name: string
  totalQuantity: number; totalCost: number; averageCost: number
  portfolioValue: number; currentPrice: number; unrealizedPnl: number; returnPct: number; tradeCount: number
}
interface Props { portfolios: Portfolio[]; trades: Trade[]; tradeMetrics: TradeMetric[]; loading: boolean; onReload: () => Promise<void> }

const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }
const inp: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', transition: 'border-color 0.15s, box-shadow 0.15s' }
const symbolColors: Record<string, string> = { SCHG: '#38bdf8', SMH: '#818cf8', AVUV: '#22d3a0', GLDM: '#fbbf24' }
const getColor = (sym: string) => symbolColors[sym.toUpperCase()] ?? 'var(--accent2)'

export default function PortfolioSection({ portfolios, tradeMetrics, onReload, loading }: Props) {
  const [name, setName] = useState(''); const [symbol, setSymbol] = useState(''); const [currentPrice, setCurrentPrice] = useState('')
  const [selectedId, setSelectedId] = useState(''); const [quantity, setQuantity] = useState(''); const [price, setPrice] = useState('')
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().slice(0, 10))
  const [savingP, setSavingP] = useState(false); const [savingT, setSavingT] = useState(false); const [deletingId, setDeletingId] = useState<string|null>(null)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => { if (portfolios.length > 0 && !selectedId) setSelectedId(portfolios[0].id) }, [portfolios, selectedId])

  const addPortfolio = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setSavingP(true)
    try {
      const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, symbol, currentPrice: Number(currentPrice) }) })
      if (!res.ok) throw new Error((await res.json()).error || 'เพิ่มพอร์ตไม่ได้')
      setName(''); setSymbol(''); setCurrentPrice(''); await onReload()
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'เกิดข้อผิดพลาด') }
    finally { setSavingP(false) }
  }

  const addTrade = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedId) return; setErr(null); setSavingT(true)
    try {
      const res = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ portfolioId: selectedId, quantity: Number(quantity), price: Number(price), date: tradeDate }) })
      if (!res.ok) throw new Error((await res.json()).error || 'บันทึกไม่ได้')
      setQuantity(''); setPrice(''); await onReload()
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'เกิดข้อผิดพลาด') }
    finally { setSavingT(false) }
  }

  const deletePortfolio = async (id: string) => {
    setErr(null); setDeletingId(id)
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('ลบไม่ได้')
      if (selectedId === id) setSelectedId('')
      await onReload()
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'เกิดข้อผิดพลาด') }
    finally { setDeletingId(null) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>ระบบลงทุน DCA</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>บันทึกการซื้อและติดตาม P&L พอร์ต ETF</p>
      </div>

      {/* Portfolio cards heatmap */}
      {tradeMetrics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
          {tradeMetrics.map((item) => {
            const pos = item.unrealizedPnl >= 0
            const color = getColor(item.symbol)
            return (
              <div key={item.portfolioId} style={{
                minHeight: 110, borderRadius: 18, padding: 16,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid rgba(255,255,255,0.08)`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.18s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${color}22`, color }}>{item.symbol}</span>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{item.tradeCount} รายการ</p>
                  </div>
                  <button onClick={() => deletePortfolio(item.portfolioId)} disabled={deletingId === item.portfolioId} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: 'var(--red2)', color: 'var(--red)', border: 'none' }}>
                    {deletingId === item.portfolioId ? '…' : 'ลบ'}
                  </button>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: 20, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>{formatMoney(item.portfolioValue)}</strong>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                    {pos ? '+' : ''}{formatMoney(item.unrealizedPnl)} ({item.returnPct.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail table */}
      {tradeMetrics.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 16 }}>รายละเอียดพอร์ต</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['ETF', 'ต้นทุนเฉลี่ย', 'ราคาปัจจุบัน', 'จำนวนหน่วย', 'ต้นทุนรวม', 'P&L'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 12px 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tradeMetrics.map((item) => {
                const pos = item.unrealizedPnl >= 0
                const color = getColor(item.symbol)
                return (
                  <tr key={item.portfolioId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${color}22`, color }}>{item.symbol}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)' }}>{formatMoney(item.averageCost)}</td>
                    <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)' }}>{formatMoney(item.currentPrice)}</td>
                    <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)' }}>{item.totalQuantity.toFixed(3)}</td>
                    <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)' }}>{formatMoney(item.totalCost)}</td>
                    <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: pos ? 'var(--green)' : 'var(--red)' }}>
                      {pos ? '+' : ''}{formatMoney(item.unrealizedPnl)}<br />
                      <span style={{ fontSize: 11, opacity: 0.8 }}>({item.returnPct.toFixed(2)}%)</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {err && <div style={{ borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 12, fontSize: 13, border: '1px solid', background: 'var(--red2)', borderColor: 'rgba(248,113,113,0.25)', color: 'var(--red)' }}>{err}</div>}

      {/* Forms row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Add portfolio */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 16 }}>เพิ่มพอร์ตใหม่</p>
          <form onSubmit={addPortfolio} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={formGroup}><label style={lbl}>ชื่อพอร์ต</label><input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Schwab Growth" required /></div>
            <div style={formGroup}><label style={lbl}>Symbol</label><input style={inp} value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="SCHG" required /></div>
            <div style={formGroup}><label style={lbl}>ราคาปัจจุบัน ($)</label><input style={inp} type="number" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="0.00" required /></div>
            <button type="submit" disabled={savingP} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 1px 10px rgba(99,102,241,0.3)', opacity: savingP ? 0.5 : 1 }}>
              {savingP ? '⟳ กำลังบันทึก…' : '+ เพิ่มพอร์ต'}
            </button>
          </form>
        </div>

        {/* Add trade */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 16 }}>บันทึก DCA</p>
          <form onSubmit={addTrade} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={formGroup}>
              <label style={lbl}>พอร์ต</label>
              <select style={inp} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {portfolios.map((p) => <option key={p.id} value={p.id}>{p.symbol} — {p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={formGroup}><label style={lbl}>จำนวนหน่วย</label><input style={inp} type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.000" required /></div>
              <div style={formGroup}><label style={lbl}>ราคา/หน่วย</label><input style={inp} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required /></div>
            </div>
            <div style={formGroup}><label style={lbl}>วันที่</label><input style={inp} type="date" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} required /></div>
            <button type="submit" disabled={savingT || !selectedId} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border2)', opacity: (savingT || !selectedId) ? 0.5 : 1 }}>
              {savingT ? '⟳ กำลังบันทึก…' : '+ บันทึก DCA'}
            </button>
          </form>
        </div>
      </div>

      {loading && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>⟳ กำลังอัปเดต…</p>}
    </div>
  )
}
