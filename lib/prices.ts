const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? 'd73conpr01qjjol2ivs0d73conpr01qjjol2ivsg'

export async function fetchMarketPrice(symbol: string): Promise<number | null> {
  const encodedSymbol = encodeURIComponent(symbol.trim().toUpperCase())
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodedSymbol}&token=${FINNHUB_API_KEY}`
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    const body = await response.json()
    const price = body?.c
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return null
    }
    return price
  } catch {
    return null
  }
}
