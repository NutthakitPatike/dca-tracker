import { NextResponse } from 'next/server'
import { createPortfolio, listPortfolios } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const portfolios = await listPortfolios(session.user.id)
  return NextResponse.json(portfolios)
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const portfolio = await createPortfolio(session.user.id, {
    name: body.name,
    symbol: body.symbol,
    currentPrice: Number(body.currentPrice),
  })
  return NextResponse.json(portfolio)
}
