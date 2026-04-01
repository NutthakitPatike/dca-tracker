import { NextResponse } from 'next/server'
import { createTransaction, listTransactions } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactions = await listTransactions(session.user.id)
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const transaction = await createTransaction(session.user.id, {
    type: body.type,
    amount: Number(body.amount),
    category: body.category,
    note: body.note,
    date: body.date,
  })

  return NextResponse.json(transaction)
}
