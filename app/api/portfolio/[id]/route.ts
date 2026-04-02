import { NextResponse } from 'next/server'
import { updatePortfolio, deletePortfolio } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const portfolio = await updatePortfolio(params.id, session.user.id, {
    name: body.name,
    symbol: body.symbol,
    currentPrice: body.currentPrice !== undefined ? Number(body.currentPrice) : undefined,
  })
  return NextResponse.json(portfolio)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 })
  }

  await deletePortfolio(params.id, session.user.id)
  return new NextResponse(null, { status: 204 })
}
