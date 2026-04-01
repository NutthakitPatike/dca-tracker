'use client'

import { useEffect, useState } from 'react'
import type { Portfolio, Trade } from '@/types/finance'
import { formatMoney } from '@/lib/metrics'

interface PortfolioSectionProps {
  portfolios: Portfolio[]
  trades: Trade[]
  tradeMetrics: Array<{
    portfolioId: string
    symbol: string
    name: string
    totalQuantity: number
    averageCost: number
    portfolioValue: number
    currentPrice: number
    tradeCount: number
  }>
  loading: boolean
  onReload: () => Promise<void>
}

export default function PortfolioSection({ portfolios, trades, tradeMetrics, onReload, loading }: PortfolioSectionProps) {
  const [name, setName] = useState('My ETF')
  const [symbol, setSymbol] = useState('SPY')
  const [currentPrice, setCurrentPrice] = useState('400')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().slice(0, 10))
  const [savingPortfolio, setSavingPortfolio] = useState(false)
  const [savingTrade, setSavingTrade] = useState(false)

  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id)
    }
  }, [portfolios, selectedPortfolioId])

  const handlePortfolioSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingPortfolio(true)

    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, symbol, currentPrice: Number(currentPrice) }),
    })

    setName('My ETF')
    setSymbol('SPY')
    setCurrentPrice('400')
    setSavingPortfolio(false)
    onReload().catch(console.error)
  }

  const handleTradeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedPortfolioId) return

    setSavingTrade(true)

    await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId: selectedPortfolioId, quantity: Number(quantity), price: Number(price), date: tradeDate }),
    })

    setQuantity('')
    setPrice('')
    setSavingTrade(false)
    onReload().catch(console.error)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-950">ระบบลงทุน DCA</h2>
        <p className="text-sm text-slate-500">เพิ่มพอร์ตและบันทึกการซื้อ DCA ได้ตามต้องการ.</p>
      </div>

      <form className="grid gap-4" onSubmit={handlePortfolioSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ชื่อพอร์ต"
            required
          />
          <input
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="สัญลักษณ์หุ้น / ETF"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <input
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(event) => setCurrentPrice(event.target.value)}
            placeholder="ราคาปัจจุบัน"
            required
          />
          <button className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" type="submit" disabled={savingPortfolio}>
            {savingPortfolio ? 'กำลังบันทึก…' : 'เพิ่มพอร์ต'}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">บันทึก DCA</h3>
        <form className="grid gap-4" onSubmit={handleTradeSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
              value={selectedPortfolioId}
              onChange={(event) => setSelectedPortfolioId(event.target.value)}
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.symbol} — {portfolio.name}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                type="number"
                step="0.001"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="จำนวนหน่วย"
                required
              />
              <input
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                type="number"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="ราคาต่อหน่วย"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.3fr_0.7fr]">
            <input
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
              type="date"
              value={tradeDate}
              onChange={(event) => setTradeDate(event.target.value)}
              required
            />
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit" disabled={savingTrade || !selectedPortfolioId}>
              {savingTrade ? 'กำลังบันทึก…' : 'บันทึก DCA'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        {tradeMetrics.map((item) => (
          <div key={item.portfolioId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.symbol} — {item.name}</p>
                <p className="text-xs text-slate-500">{item.tradeCount} รายการซื้อ</p>
              </div>
              <p className="text-sm font-semibold text-slate-950">{formatMoney(item.portfolioValue)}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-3 text-sm">
                <p className="text-slate-500">ต้นทุนเฉลี่ย</p>
                <p className="mt-2 font-semibold text-slate-950">{formatMoney(item.averageCost)}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-sm">
                <p className="text-slate-500">จำนวนหน่วย</p>
                <p className="mt-2 font-semibold text-slate-950">{item.totalQuantity.toFixed(3)}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-sm">
                <p className="text-slate-500">ราคาปัจจุบัน</p>
                <p className="mt-2 font-semibold text-slate-950">{formatMoney(item.currentPrice)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">กำลังอัปเดตข้อมูลพอร์ต…</p>}
    </div>
  )
}
