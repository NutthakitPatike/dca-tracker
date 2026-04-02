// ETF Sector allocation data
const SECTOR_ALLOCATION: Record<string, Record<string, number>> = {
  'SCHG': {
    'Technology': 0.285,      // 28.5%
    'Healthcare': 0.135,      // 13.5%
    'Financials': 0.125,      // 12.5%
    'Consumer Discretionary': 0.105, // 10.5%
    'Industrials': 0.085,     // 8.5%
    'Communication': 0.075,   // 7.5%
    'Consumer Staples': 0.065, // 6.5%
    'Energy': 0.045,          // 4.5%
    'Utilities': 0.035,        // 3.5%
    'Real Estate': 0.025,     // 2.5%
    'Materials': 0.015,        // 1.5%
    'Other': 0.005            // 0.5%
  },
  'SMH': {
    'Semiconductors': 0.65,   // 65%
    'Semiconductor Equipment': 0.25, // 25%
    'Technology': 0.08,       // 8%
    'Other': 0.02             // 2%
  },
  'AVUV': {
    'Financials': 0.18,       // 18%
    'Healthcare': 0.15,       // 15%
    'Technology': 0.12,       // 12%
    'Industrials': 0.11,      // 11%
    'Consumer Discretionary': 0.10, // 10%
    'Energy': 0.08,           // 8%
    'Materials': 0.07,        // 7%
    'Real Estate': 0.06,      // 6%
    'Communication': 0.05,    // 5%
    'Consumer Staples': 0.04, // 4%
    'Utilities': 0.03,        // 3%
    'Other': 0.01            // 1%
  },
  'GLDM': {
    'Gold': 1.0              // 100% gold
  }
}

// Sector colors for charts
const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#0084C7',
  'Healthcare': '#1a8a5c',
  'Financials': '#b8860b',
  'Consumer Discretionary': '#c43333',
  'Industrials': '#8b5cf6',
  'Communication': '#06b6d4',
  'Consumer Staples': '#10b981',
  'Energy': '#f59e0b',
  'Utilities': '#3b82f6',
  'Real Estate': '#ec4899',
  'Materials': '#84cc16',
  'Semiconductors': '#0084C7',
  'Semiconductor Equipment': '#1a8a5c',
  'Gold': '#fbbf24',
  'Other': '#6b7280'
}

export interface SectorData {
  sector: string
  value: number
  percentage: number
  color: string
}

export function calculateSectorAllocation(portfolios: any[], trades: any[]): SectorData[] {
  const sectorTotals: Record<string, number> = {}

  portfolios.forEach(portfolio => {
    const portfolioTrades = trades.filter(t => t.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
    const currentValue = Number(portfolio.currentPrice) * totalQuantity
    
    const sectors = SECTOR_ALLOCATION[portfolio.symbol] || {}
    
    Object.entries(sectors).forEach(([sector, allocation]) => {
      const sectorValue = currentValue * allocation
      sectorTotals[sector] = (sectorTotals[sector] || 0) + sectorValue
    })
  })

  const totalValue = Object.values(sectorTotals).reduce((sum, val) => sum + val, 0)

  return Object.entries(sectorTotals)
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: SECTOR_COLORS[sector] || '#6b7280'
    }))
    .sort((a, b) => b.value - a.value)
}

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] || '#6b7280'
}
