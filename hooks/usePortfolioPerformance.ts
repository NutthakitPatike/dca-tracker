import { useMemo } from 'react'
import type { Portfolio, Trade } from '@/types/finance'

interface PerformanceData {
  date: string
  value: number
  cost: number
  pnl: number
  returnPct: number
}

export function usePortfolioPerformance(portfolios: Portfolio[], trades: Trade[]) {
  const performanceData = useMemo(() => {
    if (!portfolios.length || !trades.length) return []

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Group trades by date and calculate cumulative values
    const dataByDate = new Map<string, { cost: number; quantity: Record<string, number> }>()
    
    sortedTrades.forEach(trade => {
      const date = trade.date
      const portfolio = portfolios.find(p => p.id === trade.portfolioId)
      if (!portfolio) return

      if (!dataByDate.has(date)) {
        dataByDate.set(date, { cost: 0, quantity: {} })
      }

      const dayData = dataByDate.get(date)!
      dayData.cost += Number(trade.quantity) * Number(trade.price)
      dayData.quantity[portfolio.symbol] = (dayData.quantity[portfolio.symbol] || 0) + Number(trade.quantity)
    })

    // Generate performance data for each date
    const performance: PerformanceData[] = []
    let runningCost = 0
    const runningQuantity: Record<string, number> = {}

    // Sort dates
    const sortedDates = Array.from(dataByDate.keys()).sort()
    
    sortedDates.forEach((date, index) => {
      const dayData = dataByDate.get(date)!
      
      // Update running totals
      runningCost += dayData.cost
      Object.entries(dayData.quantity).forEach(([symbol, qty]) => {
        runningQuantity[symbol] = (runningQuantity[symbol] || 0) + qty
      })

      // Calculate current value using latest prices
      let currentValue = 0
      Object.entries(runningQuantity).forEach(([symbol, qty]) => {
        const portfolio = portfolios.find(p => p.symbol === symbol)
        if (portfolio) {
          currentValue += qty * Number(portfolio.currentPrice)
        }
      })

      const pnl = currentValue - runningCost
      const returnPct = runningCost > 0 ? (pnl / runningCost) * 100 : 0

      performance.push({
        date,
        value: currentValue,
        cost: runningCost,
        pnl,
        returnPct
      })
    })

    return performance
  }, [portfolios, trades])

  const totalReturn = useMemo(() => {
    if (!performanceData.length) return { value: 0, percent: 0, days: 0 }
    
    const first = performanceData[0]
    const last = performanceData[performanceData.length - 1]
    
    const totalReturn = last.value - first.cost
    const returnPercent = first.cost > 0 ? (totalReturn / first.cost) * 100 : 0
    
    const days = Math.floor((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24))
    
    return { value: totalReturn, percent: returnPercent, days }
  }, [performanceData])

  const annualizedReturn = useMemo(() => {
    if (!totalReturn.days || totalReturn.days < 365) return totalReturn.percent
    
    const years = totalReturn.days / 365
    const annualized = Math.pow(1 + (totalReturn.percent / 100), 1 / years) - 1
    
    return annualized * 100
  }, [totalReturn])

  return {
    performanceData,
    totalReturn,
    annualizedReturn,
    bestDay: performanceData.length > 0 ? performanceData.reduce((best, curr) => curr.pnl > best.pnl ? curr : best) : null,
    worstDay: performanceData.length > 0 ? performanceData.reduce((worst, curr) => curr.pnl < worst.pnl ? curr : worst) : null
  }
}
