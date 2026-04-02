import type { Portfolio, Trade } from '@/types/finance'

// Market indices data (simplified for demo)
interface MarketIndex {
  name: string
  symbol: string
  currentPrice: number
  ytdReturn: number
  oneYearReturn: number
  threeYearReturn: number
  fiveYearReturn: number
}

const MARKET_INDICES: MarketIndex[] = [
  {
    name: 'S&P 500',
    symbol: '^GSPC',
    currentPrice: 4500,
    ytdReturn: 8.2,
    oneYearReturn: 15.3,
    threeYearReturn: 45.2,
    fiveYearReturn: 78.5
  },
  {
    name: 'NASDAQ',
    symbol: '^IXIC',
    currentPrice: 14000,
    ytdReturn: 12.5,
    oneYearReturn: 22.8,
    threeYearReturn: 58.9,
    fiveYearReturn: 125.3
  },
  {
    name: 'Dow Jones',
    symbol: '^DJI',
    currentPrice: 35000,
    ytdReturn: 6.8,
    oneYearReturn: 13.2,
    threeYearReturn: 38.7,
    fiveYearReturn: 65.4
  }
]

export interface PortfolioComparison {
  portfolioName: string
  portfolioValue: number
  portfolioReturn: number
  portfolioAnnualized: number
  benchmarks: {
    [key: string]: {
      value: number
      return: number
      outperformance: number
    }
  }
  ranking: {
    [key: string]: number
  }
}

export function calculatePortfolioComparison(portfolios: Portfolio[], trades: Trade[]): PortfolioComparison {
  // Calculate portfolio metrics
  const portfolioValue = portfolios.reduce((sum, portfolio) => {
    const portfolioTrades = trades.filter(t => t.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
    return sum + (totalQuantity * Number(portfolio.currentPrice))
  }, 0)

  // Calculate total cost
  const totalCost = trades.reduce((sum, trade) => sum + (Number(trade.quantity) * Number(trade.price)), 0)
  
  // Calculate total return
  const totalReturn = portfolioValue - totalCost
  const portfolioReturn = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
  
  // Estimate annualized return (simplified - assuming 1 year for demo)
  const portfolioAnnualized = portfolioReturn

  const benchmarks: PortfolioComparison['benchmarks'] = {}
  const ranking: PortfolioComparison['ranking'] = {}

  // Compare with each market index
  MARKET_INDICES.forEach(index => {
    const benchmarkValue = 100000 // Assume $100k starting value for comparison
    const benchmarkReturn = index.oneYearReturn
    const outperformance = portfolioReturn - benchmarkReturn
    
    benchmarks[index.name] = {
      value: benchmarkValue,
      return: benchmarkReturn,
      outperformance
    }
    
    ranking[index.name] = portfolioReturn > benchmarkReturn ? 1 : 2
  })

  return {
    portfolioName: 'DCA Portfolio',
    portfolioValue,
    portfolioReturn,
    portfolioAnnualized,
    benchmarks,
    ranking
  }
}

export function getMarketIndices(): MarketIndex[] {
  return MARKET_INDICES
}

export function getPerformanceRating(portfolioReturn: number): {
  rating: 'Excellent' | 'Good' | 'Average' | 'Below Average'
  color: string
  description: string
} {
  if (portfolioReturn >= 20) {
    return {
      rating: 'Excellent',
      color: 'var(--green)',
      description: 'พอร์ตของคุณทำได้ดีกว่าตลาดมาก!'
    }
  } else if (portfolioReturn >= 12) {
    return {
      rating: 'Good',
      color: 'var(--accent)',
      description: 'พอร์ตของคุณทำได้ดีกว่าตลาด'
    }
  } else if (portfolioReturn >= 5) {
    return {
      rating: 'Average',
      color: 'var(--amber)',
      description: 'พอร์ตของคุณทำได้ในระดับเฉลี่ย'
    }
  } else {
    return {
      rating: 'Below Average',
      color: 'var(--red)',
      description: 'พอร์ตของคุณทำได้ต่ำกว่าตลาด'
    }
  }
}
