import { NextResponse } from 'next/server'
import { fetchMarketPrice } from '@/lib/prices'
import { dcaAllocations } from '@/lib/config'

export async function GET() {
  const assets = await Promise.all(
    dcaAllocations.map(async (asset) => {
      const currentPrice = await fetchMarketPrice(asset.symbol)
      return {
        symbol: asset.symbol,
        name: asset.name,
        weight: asset.weight,
        currentPrice,
      }
    }),
  )

  return NextResponse.json({ assets })
}
