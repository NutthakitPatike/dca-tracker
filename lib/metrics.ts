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

    return {
      portfolioId: portfolio.id,
      symbol: portfolio.symbol,
      name: portfolio.name,
      totalQuantity,
      averageCost,
      portfolioValue,
      currentPrice,
      tradeCount: portfolioTrades.length,
    }
  })
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
