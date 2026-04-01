import { prisma } from '@/lib/prisma'
import type { TransactionType } from '@/types/finance'
import { fetchMarketPrice } from '@/lib/prices'

const dcaAllocations = [
  { symbol: 'SCHG', weight: 0.4, name: 'Schwab U.S. Large-Cap Growth ETF' },
  { symbol: 'SMH', weight: 0.3, name: 'VanEck Semiconductor ETF' },
  { symbol: 'AVUV', weight: 0.2, name: 'Avantis U.S. Small Cap Value ETF' },
  { symbol: 'GLDM', weight: 0.1, name: 'SPDR Gold MiniShares Trust' },
]

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function listTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })
}

export async function createTransaction(userId: string, data: {
  type: TransactionType
  amount: number
  category: string
  note?: string
  date: string
}) {
  return prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      note: data.note ?? '',
      date: new Date(data.date),
    },
  })
}

export async function updateTransaction(id: string, userId: string, data: Partial<{ type: TransactionType; amount: number; category: string; note: string; date: string }>) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      note: data.note,
      date: data.date ? new Date(data.date) : undefined,
    },
  })
}

export async function deleteTransaction(id: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!transaction) {
    throw new Error('Transaction not found')
  }
  return prisma.transaction.delete({ where: { id } })
}

export async function listPortfolios(userId: string) {
  return prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createPortfolio(userId: string, data: { name: string; symbol: string; currentPrice: number }) {
  return prisma.portfolio.create({
    data: {
      userId,
      name: data.name,
      symbol: data.symbol,
      currentPrice: data.currentPrice,
    },
  })
}

export async function updatePortfolio(id: string, userId: string, data: Partial<{ name: string; symbol: string; currentPrice: number }>) {
  const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  return prisma.portfolio.update({
    where: { id },
    data: {
      name: data.name,
      symbol: data.symbol,
      currentPrice: data.currentPrice,
    },
  })
}

export async function deletePortfolio(id: string, userId: string) {
  const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!portfolio) {
    throw new Error('Portfolio not found')
  }
  await prisma.trade.deleteMany({ where: { portfolioId: id } })
  return prisma.portfolio.delete({ where: { id } })
}

export async function listTrades(userId: string) {
  return prisma.trade.findMany({
    where: { portfolio: { userId } },
    orderBy: { date: 'desc' },
  })
}

export async function createTrade(userId: string, data: { portfolioId: string; quantity: number; price: number; date: string }) {
  const portfolio = await prisma.portfolio.findFirst({ where: { id: data.portfolioId, userId } })
  if (!portfolio) {
    throw new Error('Portfolio not found')
  }
  return prisma.trade.create({
    data: {
      portfolioId: data.portfolioId,
      quantity: data.quantity,
      price: data.price,
      amount: data.quantity * data.price,
      date: new Date(data.date),
    },
  })
}

export async function updateTrade(id: string, userId: string, data: Partial<{ quantity: number; price: number; date: string }>) {
  const trade = await prisma.trade.findFirst({ where: { id, portfolio: { userId } } })
  if (!trade) {
    throw new Error('Trade not found')
  }

  return prisma.trade.update({
    where: { id },
    data: {
      quantity: data.quantity,
      price: data.price,
      amount: data.quantity !== undefined && data.price !== undefined ? data.quantity * data.price : undefined,
      date: data.date ? new Date(data.date) : undefined,
    },
  })
}

export async function deleteTrade(id: string, userId: string) {
  const trade = await prisma.trade.findFirst({ where: { id, portfolio: { userId } } })
  if (!trade) {
    throw new Error('Trade not found')
  }
  return prisma.trade.delete({ where: { id } })
}

export async function refreshPortfolioPrices(userId: string) {
  const portfolios = await prisma.portfolio.findMany({ where: { userId } })
  const updates = [] as Promise<unknown>[]

  for (const portfolio of portfolios) {
    const price = await fetchMarketPrice(portfolio.symbol)
    if (price !== null) {
      updates.push(
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { currentPrice: price },
        }),
      )
    }
  }

  await Promise.all(updates)
  return prisma.portfolio.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function ensureDcaPortfolios(userId: string) {
  return Promise.all(
    dcaAllocations.map(async (asset) => {
      let portfolio = await prisma.portfolio.findFirst({ where: { userId, symbol: asset.symbol } })
      if (!portfolio) {
        const currentPrice = (await fetchMarketPrice(asset.symbol)) ?? 0
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            name: asset.name,
            symbol: asset.symbol,
            currentPrice,
          },
        })
      }
      return portfolio
    }),
  )
}

export async function executeDcaInvestment(userId: string, amount: number, date: string) {
  const portfolios = await ensureDcaPortfolios(userId)
  const trades = [] as Awaited<ReturnType<typeof prisma.trade.create>>[]

  for (const allocation of dcaAllocations) {
    const portfolio = portfolios.find((item) => item.symbol === allocation.symbol)
    if (!portfolio) continue

    let price = Number(portfolio.currentPrice)
    if (!price || price <= 0) {
      const fetchedPrice = await fetchMarketPrice(portfolio.symbol)
      if (fetchedPrice) {
        price = fetchedPrice
        await prisma.portfolio.update({ where: { id: portfolio.id }, data: { currentPrice: price } })
      }
    }

    const targetAmount = amount * allocation.weight
    const quantity = price > 0 ? targetAmount / price : 0
    if (quantity <= 0) continue

    const trade = await prisma.trade.create({
      data: {
        portfolioId: portfolio.id,
        quantity,
        price,
        amount: quantity * price,
        date: new Date(date),
      },
    })
    trades.push(trade)
  }

  return { portfolios, trades }
}
