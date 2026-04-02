import type { Portfolio, Transaction, Trade } from '@/types/finance'

const parseDecimal = (value: string | number) => Number(value ?? 0)

export function calculateTotals(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + parseDecimal(item.amount), 0)

  const totalExpense = transactions
    .filter((item) => item.type === 'EXPENSE')
    .reduce((sum, item) => sum + parseDecimal(item.amount), 0)

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  }
}

export function calculatePortfolioMetrics(portfolios: Portfolio[], trades: Trade[]) {
  const metrics = portfolios.map((portfolio) => {
    const portfolioTrades = trades.filter((trade) => trade.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, trade) => sum + parseDecimal(trade.quantity), 0)
    const currentPrice = parseDecimal(portfolio.currentPrice)
    return totalQuantity * currentPrice
  })

  return {
    portfolioValue: metrics.reduce((sum, value) => sum + value, 0),
  }
}

export function calculateTradeMetrics(portfolios: Portfolio[], trades: Trade[]) {
  return portfolios.map((portfolio) => {
    const portfolioTrades = trades.filter((trade) => trade.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, trade) => sum + parseDecimal(trade.quantity), 0)
    const totalCost = portfolioTrades.reduce(
      (sum, trade) => sum + parseDecimal(trade.quantity) * parseDecimal(trade.price),
      0,
    )
    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0
    const currentPrice = parseDecimal(portfolio.currentPrice)
    const portfolioValue = currentPrice * totalQuantity
    const unrealizedPnl = portfolioValue - totalCost
    const returnPct = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0

    return {
      portfolioId: portfolio.id,
      symbol: portfolio.symbol,
      name: portfolio.name,
      totalQuantity,
      totalCost,
      averageCost,
      portfolioValue,
      currentPrice,
      unrealizedPnl,
      returnPct,
      tradeCount: portfolioTrades.length,
    }
  })
}

export function formatMoney(value: number, currency: 'USD' | 'THB' = 'USD') {
  return new Intl.NumberFormat(currency === 'THB' ? 'th-TH' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export async function formatMoneyDual(value: number): Promise<{ USD: string; THB: string }> {
  // Import dynamically to avoid circular dependency
  const { getExchangeRate } = await import('./exchange-rate')
  const rate = await getExchangeRate()
  
  return {
    USD: formatMoney(value, 'USD'),
    THB: formatMoney(value * rate, 'THB')
  }
}

// Synchronous version for components that can't wait
export function formatMoneyDualSync(value: number, fallbackRate: number = 35): { USD: string; THB: string } {
  return {
    USD: formatMoney(value, 'USD'),
    THB: formatMoney(value * fallbackRate, 'THB')
  }
}
