import { NextResponse } from 'next/server'
import { fetchMarketPrice } from '@/lib/prices'

const dcaAllocations = [
  { symbol: 'SCHG', weight: 0.4, name: 'Schwab U.S. Large-Cap Growth ETF' },
  { symbol: 'SMH', weight: 0.3, name: 'VanEck Semiconductor ETF' },
  { symbol: 'AVUV', weight: 0.2, name: 'Avantis U.S. Small Cap Value ETF' },
  { symbol: 'GLDM', weight: 0.1, name: 'SPDR Gold MiniShares Trust' },
]

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
