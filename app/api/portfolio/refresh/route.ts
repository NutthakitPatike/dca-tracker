import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { refreshPortfolioPrices } from '@/lib/finance'

export async function POST() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const portfolios = await refreshPortfolioPrices(session.user.id)
  return NextResponse.json(portfolios)
}
