import { NextResponse } from 'next/server'
import { createPortfolio, listPortfolios } from '@/lib/finance'
import { getAuthSession } from '@/lib/auth'
import { portfolioSchema, formatValidationError } from '@/lib/validation'

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

  try {
    const body = await request.json()
    const data = portfolioSchema.parse(body)
    const portfolio = await createPortfolio(session.user.id, data)
    return NextResponse.json(portfolio)
  } catch (error) {
    return NextResponse.json({ error: formatValidationError(error) }, { status: 400 })
  }
}
