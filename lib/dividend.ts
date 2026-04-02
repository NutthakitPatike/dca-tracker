import type { Portfolio, Trade } from '@/types/finance'

// ETF Dividend yield data (approximate annual yields)
const DIVIDEND_YIELDS: Record<string, number> = {
  'SCHG': 0.004,    // 0.4% - Schwab U.S. Large-Cap Growth (low dividend)
  'SMH': 0.008,     // 0.8% - VanEck Semiconductor ETF
  'AVUV': 0.018,    // 1.8% - Avantis U.S. Small Cap Value ETF
  'GLDM': 0.0,      // 0% - SPDR Gold MiniShares Trust (no dividends)
}

export interface DividendData {
  symbol: string
  name: string
  quantity: number
  estimatedAnnualDividend: number
  estimatedQuarterlyDividend: number
  annualYield: number
  currentPrice: number
}

export function calculateDividends(portfolios: Portfolio[], trades: Trade[]): DividendData[] {
  return portfolios.map(portfolio => {
    const portfolioTrades = trades.filter(t => t.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
    const currentPrice = Number(portfolio.currentPrice)
    const annualYield = DIVIDEND_YIELDS[portfolio.symbol] || 0
    
    const estimatedAnnualDividend = totalQuantity * currentPrice * annualYield
    const estimatedQuarterlyDividend = estimatedAnnualDividend / 4
    
    return {
      symbol: portfolio.symbol,
      name: portfolio.name,
      quantity: totalQuantity,
      estimatedAnnualDividend,
      estimatedQuarterlyDividend,
      annualYield,
      currentPrice
    }
  }).filter(d => d.estimatedAnnualDividend > 0) // Only show ETFs that pay dividends
}

export function getTotalDividendIncome(dividends: DividendData[]): {
  annual: number
  quarterly: number
  monthly: number
} {
  const annual = dividends.reduce((sum, d) => sum + d.estimatedAnnualDividend, 0)
  return {
    annual,
    quarterly: annual / 4,
    monthly: annual / 12
  }
}
