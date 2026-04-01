import { NextResponse } from 'next/server'
import { createTransaction, listTransactions } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'
import { transactionSchema, formatValidationError } from '@/lib/validation'

export async function GET(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))

  const result = await listTransactions(session.user.id, page, pageSize)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = transactionSchema.parse(body)
    const transaction = await createTransaction(session.user.id, data)
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: formatValidationError(error) }, { status: 400 })
  }
}
