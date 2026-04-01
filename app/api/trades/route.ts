import { NextResponse } from 'next/server'
import { createTrade, listTrades } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const trades = await listTrades(session.user.id)
  return NextResponse.json(trades)
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const trade = await createTrade(session.user.id, {
    portfolioId: body.portfolioId,
    quantity: Number(body.quantity),
    price: Number(body.price),
    date: body.date,
  })
  return NextResponse.json(trade)
}
