import { NextResponse } from 'next/server'
import { deleteTransaction, updateTransaction } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const transaction = await updateTransaction(params.id, session.user.id, {
    type: body.type,
    amount: body.amount ? Number(body.amount) : undefined,
    category: body.category,
    note: body.note,
    date: body.date,
  })
  return NextResponse.json(transaction)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 })
  }

  await deleteTransaction(params.id, session.user.id)
  return new NextResponse(null, { status: 204 })
}
