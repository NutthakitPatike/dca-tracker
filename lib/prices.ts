export async function fetchMarketPrice(symbol: string): Promise<number | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    console.warn('FINNHUB_API_KEY is not set')
    return null
  }

  const encodedSymbol = encodeURIComponent(symbol.trim().toUpperCase())
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodedSymbol}&token=${apiKey}`
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
