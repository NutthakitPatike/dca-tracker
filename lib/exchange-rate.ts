// Exchange rate service
let cachedRate: number | null = null
let lastFetch: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getExchangeRate(): Promise<number> {
  const now = Date.now()
  
  // Return cached rate if still valid
  if (cachedRate && lastFetch && (now - lastFetch) < CACHE_DURATION) {
    return cachedRate
  }

  try {
    // Fetch current USD to THB exchange rate
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }
    
    const data = await response.json()
    const rate = data.rates.THB
    
    if (!rate || rate <= 0) {
      throw new Error('Invalid exchange rate received')
    }
    
    // Cache the rate
    cachedRate = rate
    lastFetch = now
    
    return rate
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    
    // Fallback to cached rate if available
    if (cachedRate) {
      return cachedRate
    }
    
    // Default fallback rate
    return 35.0
  }
}

export function formatMoneyWithLiveRate(value: number): { USD: string; THB: string } {
  // For now, use cached rate or default
  // In a real implementation, you'd want to fetch the rate asynchronously
  const rate = cachedRate || 35.0
  
  return {
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value),
    THB: new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2,
    }).format(value * rate)
  }
}

// Initialize exchange rate on module load
getExchangeRate().catch(console.error)
