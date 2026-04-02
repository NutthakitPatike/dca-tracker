const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const priceCache = new Map<string, { price: number; timestamp: number }>()

export async function fetchMarketPrice(symbol: string): Promise<number | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    console.warn('FINNHUB_API_KEY is not set')
    return null
  }

  const key = symbol.trim().toUpperCase()

  const cached = priceCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.price
  }

  const encodedSymbol = encodeURIComponent(key)
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodedSymbol}&token=${apiKey}`
    const response = await fetch(url)
    if (!response.ok) {
      return cached?.price ?? null
    }
    const body = await response.json()
    const price = body?.c
    if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
      return cached?.price ?? null
    }

    priceCache.set(key, { price, timestamp: Date.now() })
    return price
  } catch {
    return cached?.price ?? null
  }
}
