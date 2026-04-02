import { NextResponse } from 'next/server'
import { updateTrade, deleteTrade } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const trade = await updateTrade(params.id, session.user.id, {
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
      date: body.date,
    })
    return NextResponse.json(trade)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 })
  }

  try {
    await deleteTrade(params.id, session.user.id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
