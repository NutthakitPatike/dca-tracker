import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { parseMultipleSlipTexts } from '@/lib/slip-parser'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const texts: string[] = body.texts

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'No OCR texts provided' }, { status: 400 })
    }

    if (texts.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 slips' }, { status: 400 })
    }

    const parsed = await parseMultipleSlipTexts(texts)

    const results = []
    for (const slip of parsed) {
      let portfolio = await prisma.portfolio.findFirst({
        where: { userId: session.user.id, symbol: slip.symbol },
      })

      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            userId: session.user.id,
            name: slip.symbol,
            symbol: slip.symbol,
            currentPrice: slip.price,
          },
        })
      }

      const trade = await prisma.trade.create({
        data: {
          portfolioId: portfolio.id,
          quantity: slip.quantity,
          price: slip.price,
          amount: slip.amount,
          date: new Date(slip.date),
        },
      })

      results.push({
        symbol: slip.symbol,
        price: slip.price,
        quantity: slip.quantity,
        amount: slip.amount,
        date: slip.date,
        tradeId: trade.id,
        portfolioId: portfolio.id,
      })
    }

    return NextResponse.json({ trades: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse slips'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
