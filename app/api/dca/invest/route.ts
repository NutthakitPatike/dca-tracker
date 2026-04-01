import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { executeDcaInvestment } from '@/lib/finance'

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const amount = Number(body.amount)
  const date = body.date ?? new Date().toISOString().slice(0, 10)

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const result = await executeDcaInvestment(session.user.id, amount, date)
  return NextResponse.json(result)
}
