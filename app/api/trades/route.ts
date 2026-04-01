import { NextResponse } from 'next/server'
import { createTrade, listTrades } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'
import { tradeSchema, formatValidationError } from '@/lib/validation'

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

  try {
    const body = await request.json()
    const data = tradeSchema.parse(body)
    const trade = await createTrade(session.user.id, data)
    return NextResponse.json(trade)
  } catch (error) {
    return NextResponse.json({ error: formatValidationError(error) }, { status: 400 })
  }
}
