'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Portfolio, Trade } from '@/types/finance'
import { calculateTradeMetrics, formatMoney, formatMoneyDualSync } from '@/lib/metrics'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { exportPortfolioToCSV, exportTradesToCSV, downloadCSV } from '@/lib/export'
import DcaAllocation from './DcaAllocation'
import DcaInvestForm from './DcaInvestForm'
import SlipUpload from './SlipUpload'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ExportButton from '@/components/ui/ExportButton'
import PerformanceChart from './PerformanceChart'
import DividendTracker from './DividendTracker'
import SectorAllocation from './SectorAllocation'
import { SkeletonMetrics, SkeletonChart } from '@/components/ui/Skeleton'

const symbolColors: Record<string, string> = { SCHG: '#0084C7', SMH: '#1a8a5c', AVUV: '#b8860b', GLDM: '#c43333' }
const getColor = (sym: string) => symbolColors[sym.toUpperCase()] ?? '#818cf8'

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px 24px' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6, color: color ?? 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

function MetricDual({ label, value, sub, color }: { label: string; value: number; sub?: string; color?: string }) {
  const { rate } = useExchangeRate()
  const { USD, THB } = formatMoneyDualSync(value, rate)
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px 24px' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4, color: color ?? 'var(--text)' }}>{USD}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>{THB}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { rate } = useExchangeRate()
  const { USD, THB } = formatMoneyDualSync(payload[0].value, rate)
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '8px 12px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: 'var(--text)' }}>
      <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: 'var(--text2)' }}>{USD}</p>
      <p style={{ color: 'var(--muted)', fontSize: 11 }}>{THB}</p>
    </div>
  )
}

export default function InvestShell() {
  const { status } = useSession()
  const { rate, loading: rateLoading } = useExchangeRate()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const [expandedPortfolio, setExpandedPortfolio] = useState<string | null>(null)
  const [editingTrade, setEditingTrade] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Export functions
  const handleExportPortfolio = async () => {
    setIsExporting(true)
    try {
      const csv = exportPortfolioToCSV(portfolios, trades, rate)
      const filename = `portfolio_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportTrades = async () => {
    setIsExporting(true)
    try {
      const csv = exportTradesToCSV(trades, portfolios, rate)
      const filename = `trades_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }
  const [editDate, setEditDate] = useState('')
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null)
  const [confirmDeleteTrade, setConfirmDeleteTrade] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [curPrice, setCurPrice] = useState('')
  const [selId, setSelId] = useState('')
  const [qty, setQty] = useState('')
  const [tradePrice, setTradePrice] = useState('')
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().slice(0, 10))
  const [savingP, setSavingP] = useState(false)
  const [savingT, setSavingT] = useState(false)
  const [formErr, setFormErr] = useState<string | null>(null)

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

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/portfolio/refresh', { method: 'POST' }).finally(() => loadData().catch(console.error))
    }
  }, [status])

  useEffect(() => { if (portfolios.length > 0 && !selId) setSelId(portfolios[0].id) }, [portfolios, selId])

  const tradeMetrics = calculateTradeMetrics(portfolios, trades)
  const totalValue = tradeMetrics.reduce((s, m) => s + m.portfolioValue, 0)
  const totalCost  = tradeMetrics.reduce((s, m) => s + m.totalCost, 0)
  const totalPnl   = tradeMetrics.reduce((s, m) => s + m.unrealizedPnl, 0)
  const totalRet   = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const addPortfolio = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr(null); setSavingP(true)
    try {
      const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, symbol, currentPrice: Number(curPrice) }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setName(''); setSymbol(''); setCurPrice(''); await loadData()
    } catch (err) { setFormErr(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') }
    finally { setSavingP(false) }
  }

  const addTrade = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selId) return; setFormErr(null); setSavingT(true)
    try {
      const res = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ portfolioId: selId, quantity: Number(qty), price: Number(tradePrice), date: tradeDate }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setQty(''); setTradePrice(''); await loadData()
    } catch (err) { setFormErr(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') }
    finally { setSavingT(false) }
  }

  const requestDelete = (id: string) => setConfirmDelete(id)

  const deletePortfolio = async (id: string) => {
    setConfirmDelete(null)
    setDeletingId(id)
    try {
      await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
      if (selId === id) setSelId('')
      if (expandedPortfolio === id) setExpandedPortfolio(null)
      await loadData()
    } finally { setDeletingId(null) }
  }

  const clearAllPortfolios = async () => {
    setConfirmClearAll(false)
    setClearingAll(true)
    try {
      for (const p of portfolios) {
        await fetch(`/api/portfolio/${p.id}`, { method: 'DELETE' })
      }
      setSelId('')
      setExpandedPortfolio(null)
      await loadData()
    } finally { setClearingAll(false) }
  }

  const startEditTrade = (t: Trade) => {
    setEditingTrade(t.id)
    setEditQty(String(Number(t.quantity)))
    setEditPrice(String(Number(t.price)))
    setEditDate(new Date(t.date).toISOString().slice(0, 10))
  }

  const saveEditTrade = async (id: string) => {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(editQty), price: Number(editPrice), date: editDate }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingTrade(null)
      await loadData()
    } catch (err) { setError(err instanceof Error ? err.message : 'แก้ไขไม่ได้') }
  }

  const deleteOneTrade = async (id: string) => {
    setConfirmDeleteTrade(null)
    setDeletingTradeId(id)
    try {
      await fetch(`/api/trades/${id}`, { method: 'DELETE' })
      await loadData()
    } finally { setDeletingTradeId(null) }
  }

  const expandedTrades = expandedPortfolio ? trades.filter((t) => t.portfolioId === expandedPortfolio) : []
  const expandedMeta = expandedPortfolio ? tradeMetrics.find((m) => m.portfolioId === expandedPortfolio) : null

  const inp: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.6px' }}>พอร์ต DCA</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
              <span>อัตรา USD/THB:</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: 'var(--accent)' }}>
                {rateLoading ? '...' : rate.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ExportButton 
                onExport={handleExportPortfolio} 
                filename="Portfolio" 
                isLoading={isExporting}
              />
              <ExportButton 
                onExport={handleExportTrades} 
                filename="Trades" 
                isLoading={isExporting}
              />
            </div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>ติดตามพอร์ต ETF และบันทึกการลงทุน DCA</p>
      </div>

      {error && <div style={{ padding: '12px 16px', marginBottom: 16, fontSize: 13, border: '1px solid var(--red)', background: 'var(--red2)', color: 'var(--red)' }}>{error}</div>}

      {/* Confirm dialog — delete single */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="ลบพอร์ต?"
        message="คุณต้องการลบพอร์ตนี้และ trade ทั้งหมดที่เกี่ยวข้องหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        onConfirm={() => confirmDelete && deletePortfolio(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      {/* Confirm dialog — clear all */}
      <ConfirmDialog
        open={confirmClearAll}
        title="ล้างทั้งพอร์ต?"
        message={`คุณต้องการลบพอร์ตทั้งหมด ${portfolios.length} พอร์ต พร้อม trade ทุกรายการหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ล้างทั้งหมด"
        onConfirm={clearAllPortfolios}
        onCancel={() => setConfirmClearAll(false)}
      />

      {/* Metrics */}
      {loading ? <SkeletonMetrics /> : (
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricDual label="มูลค่ารวม" value={totalValue} color="var(--accent2)" />
        <MetricDual label="ต้นทุนรวม" value={totalCost} />
        <MetricDual label="Unrealized P&L" value={totalPnl} color={totalPnl >= 0 ? 'var(--green)' : 'var(--red)'} />
        <Metric label="Return %" value={`${totalRet >= 0 ? '+' : ''}${totalRet.toFixed(2)}%`} color={totalRet >= 0 ? 'var(--green)' : 'var(--red)'} />
      </div>
      )}

      {/* Performance Chart */}
      <PerformanceChart portfolios={portfolios} trades={trades} exchangeRate={rate} />

      {/* Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <DividendTracker portfolios={portfolios} trades={trades} exchangeRate={rate} />
        <SectorAllocation portfolios={portfolios} trades={trades} exchangeRate={rate} />
      </div>

      {/* Main content grid */}
      <div className="grid-main" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Heatmap cards */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>รายละเอียดพอร์ต</p>
            {tradeMetrics.length > 0 && (
              <button onClick={() => setConfirmClearAll(true)} disabled={clearingAll}
                style={{ padding: '4px 10px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--red)', border: '1px solid var(--red)', opacity: clearingAll ? 0.5 : 1 }}>
                {clearingAll ? 'กำลังล้าง…' : 'ล้างทั้งพอร์ต'}
              </button>
            )}
          </div>
          {tradeMetrics.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                {tradeMetrics.map((item) => {
                  const pos = item.unrealizedPnl >= 0
                  const c = getColor(item.symbol)
                  return (
                    <div key={item.portfolioId}
                      onClick={() => setExpandedPortfolio(expandedPortfolio === item.portfolioId ? null : item.portfolioId)}
                      style={{ minHeight: 110, padding: 16, background: expandedPortfolio === item.portfolioId ? 'var(--accent-light)' : 'var(--bg)', border: `1px solid ${expandedPortfolio === item.portfolioId ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${c}22`, color: c }}>{item.symbol}</span>
                          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{item.tradeCount} รายการ · {item.totalQuantity.toFixed(3)} หน่วย</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); requestDelete(item.portfolioId) }} disabled={deletingId === item.portfolioId}
                          style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--red)', border: '1px solid var(--red)' }}>
                          {deletingId === item.portfolioId ? '…' : 'ลบ'}
                        </button>
                      </div>
                      <div>
                        <div>
                          <strong style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: 'var(--text)', display: 'block', letterSpacing: '-0.5px' }}>
                            {formatMoney(item.portfolioValue, 'USD')}
                          </strong>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text2)' }}>
                            {formatMoney(item.portfolioValue * rate, 'THB')}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                          {pos ? '+' : ''}{formatMoney(item.unrealizedPnl, 'USD')} ({item.returnPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Confirm delete trade */}
              <ConfirmDialog
                open={!!confirmDeleteTrade}
                title="ลบรายการ trade?"
                message="คุณต้องการลบรายการ trade นี้หรือไม่?"
                confirmLabel="ลบ"
                onConfirm={() => confirmDeleteTrade && deleteOneTrade(confirmDeleteTrade)}
                onCancel={() => setConfirmDeleteTrade(null)}
              />

              {/* Expanded trade list */}
              {expandedPortfolio && expandedMeta && (
                <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>
                      <span style={{ color: getColor(expandedMeta.symbol) }}>{expandedMeta.symbol}</span>
                      <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11, marginLeft: 8 }}>{expandedTrades.length} รายการ</span>
                    </p>
                    <button onClick={() => { setExpandedPortfolio(null); setEditingTrade(null) }} style={{ padding: '2px 8px', fontSize: 10, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}>ปิด</button>
                  </div>
                  {expandedTrades.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                            {['วันที่', 'จำนวน', 'ราคา/หน่วย', 'มูลค่า', ''].map((h, i) => (
                              <th key={i} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 8px 8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {expandedTrades.map((t) => {
                            const isEditing = editingTrade === t.id
                            const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" }
                            const eInp: React.CSSProperties = { ...mono, fontSize: 11, padding: '4px 6px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', width: '100%' }
                            return (
                              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '8px', ...mono, fontSize: 11, color: 'var(--muted)' }}>
                                  {isEditing ? <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} style={{ ...eInp, width: 120 }} /> : new Date(t.date).toLocaleDateString('th-TH')}
                                </td>
                                <td style={{ padding: '8px', ...mono, fontSize: 12, color: 'var(--text2)' }}>
                                  {isEditing ? <input type="number" step="any" value={editQty} onChange={(e) => setEditQty(e.target.value)} style={{ ...eInp, width: 80 }} /> : Number(t.quantity).toFixed(4)}
                                </td>
                                <td style={{ padding: '8px', ...mono, fontSize: 12, color: 'var(--text2)' }}>
                                  {isEditing ? <input type="number" step="any" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ ...eInp, width: 80 }} /> : `$${Number(t.price).toFixed(2)}`}
                                </td>
                                <td style={{ padding: '8px', ...mono, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                                  {isEditing ? `$${(Number(editQty) * Number(editPrice)).toFixed(2)}` : `$${Number(t.amount).toFixed(2)}`}
                                </td>
                                <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button onClick={() => saveEditTrade(t.id)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none' }}>บันทึก</button>
                                      <button onClick={() => setEditingTrade(null)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}>ยกเลิก</button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button onClick={() => startEditTrade(t)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--accent)', border: '1px solid var(--accent)' }}>แก้ไข</button>
                                      <button onClick={() => setConfirmDeleteTrade(t.id)} disabled={deletingTradeId === t.id}
                                        style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--red)', border: '1px solid var(--red)' }}>
                                        {deletingTradeId === t.id ? '…' : 'ลบ'}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>ไม่มี trade</p>
                  )}
                </div>
              )}

              {/* Detail table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                    {['ETF', 'ต้นทุนเฉลี่ย', 'ราคาปัจจุบัน', 'ต้นทุนรวม', 'P&L'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 10px 8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tradeMetrics.map((item) => {
                    const pos = item.unrealizedPnl >= 0; const c = getColor(item.symbol)
                    return (
                      <tr key={item.portfolioId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '9px 10px' }}><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${c}22`, color: c }}>{item.symbol}</span></td>
                        <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)', fontSize: 12 }}>
                          <div>{formatMoney(item.averageCost, 'USD')}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatMoney(item.averageCost * rate, 'THB')}</div>
                        </td>
                        <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)', fontSize: 12 }}>
                          <div>{formatMoney(item.currentPrice, 'USD')}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatMoney(item.currentPrice * rate, 'THB')}</div>
                        </td>
                        <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)', fontSize: 12 }}>
                          <div>{formatMoney(item.totalCost, 'USD')}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatMoney(item.totalCost * rate, 'THB')}</div>
                        </td>
                        <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 12, color: pos ? 'var(--green)' : 'var(--red)' }}>
                          <div>{pos ? '+' : ''}{formatMoney(item.unrealizedPnl, 'USD')}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatMoney(item.unrealizedPnl * rate, 'THB')}</div>
                          <span style={{ fontSize: 10, opacity: 0.8 }}>({item.returnPct.toFixed(2)}%)</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีพอร์ต — เพิ่มพอร์ตด้านล่าง</div>
          )}
        </div>

        {/* Right column: Pie + DCA allocation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pie chart */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>สัดส่วนพอร์ต</p>
            {tradeMetrics.length > 0 ? (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={tradeMetrics.map(m => ({ name: m.symbol, value: m.portfolioValue }))} cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={3} dataKey="value">
                        {tradeMetrics.map((m) => <Cell key={m.symbol} fill={getColor(m.symbol)} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tradeMetrics.map((m) => (
                    <div key={m.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 10, height: 2, background: getColor(m.symbol) }} />
                      <span style={{ color: 'var(--text2)', minWidth: 45 }}>{m.symbol}</span>
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--text)', fontWeight: 600 }}>{formatMoney(m.portfolioValue, 'USD')}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--text2)', fontSize: 11 }}>{formatMoney(m.portfolioValue * rate, 'THB')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>ยังไม่มีข้อมูล</div>
            )}
          </div>

          {/* DCA Basket */}
          <DcaAllocation />
        </div>
      </div>

      {/* Slip upload */}
      <div style={{ marginBottom: 16 }}>
        <SlipUpload onSuccess={loadData} />
      </div>

      {/* Forms row */}
      <div className="grid-forms" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Add portfolio */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>เพิ่มพอร์ตใหม่</p>
          <form onSubmit={addPortfolio} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={lbl}>ชื่อพอร์ต</label><input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Schwab Growth" required /></div>
            <div><label style={lbl}>Symbol</label><input style={inp} value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="SCHG" required /></div>
            <div><label style={lbl}>ราคา ($)</label><input style={inp} type="number" step="0.01" value={curPrice} onChange={(e) => setCurPrice(e.target.value)} placeholder="0.00" required /></div>
            <button type="submit" disabled={savingP} style={{ padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', opacity: savingP ? 0.5 : 1 }}>
              {savingP ? 'บันทึก…' : 'เพิ่มพอร์ต'}
            </button>
          </form>
        </div>

        {/* Add trade */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>บันทึก DCA (manual)</p>
          <form onSubmit={addTrade} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={lbl}>พอร์ต</label><select style={inp} value={selId} onChange={(e) => setSelId(e.target.value)}>{portfolios.map((p) => <option key={p.id} value={p.id}>{p.symbol}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label style={lbl}>หน่วย</label><input style={inp} type="number" step="0.001" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0.000" required /></div>
              <div><label style={lbl}>ราคา/หน่วย</label><input style={inp} type="number" step="0.01" value={tradePrice} onChange={(e) => setTradePrice(e.target.value)} placeholder="0.00" required /></div>
            </div>
            <div><label style={lbl}>วันที่</label><input style={inp} type="date" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} required /></div>
            <button type="submit" disabled={savingT || !selId} style={{ padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', opacity: (savingT || !selId) ? 0.5 : 1 }}>
              {savingT ? 'บันทึก…' : 'บันทึก DCA'}
            </button>
          </form>
        </div>

        {/* Auto DCA */}
        <DcaInvestForm onSuccess={loadData} />
      </div>

      {formErr && <div style={{ padding: '10px 14px', fontSize: 13, border: '1px solid var(--red)', background: 'var(--red2)', color: 'var(--red)' }}>{formErr}</div>}
      {loading && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>⟳ กำลังอัปเดต…</p>}
    </div>
  )
}
