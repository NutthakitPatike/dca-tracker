// Multi-currency support
export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: Date
}

export interface Currency {
  code: string
  symbol: string
  name: string
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' }
]

// Mock exchange rates (in real app, would fetch from API)
export const MOCK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.85, JPY: 110.5, THB: 35.0 },
  EUR: { USD: 1.18, JPY: 130.2, THB: 41.2 },
  JPY: { USD: 0.0091, EUR: 0.0077, THB: 0.32 },
  THB: { USD: 0.0286, EUR: 0.0243, JPY: 3.13 }
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount
  
  const rate = MOCK_EXCHANGE_RATES[from]?.[to]
  if (!rate) {
    console.warn(`No exchange rate found for ${from} to ${to}`)
    return amount
  }
  
  return amount * rate
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency)
  if (!currencyInfo) return amount.toString()
  
  const formatter = new Intl.NumberFormat(
    currency === 'JPY' ? 'ja-JP' : 
    currency === 'EUR' ? 'de-DE' : 
    currency === 'THB' ? 'th-TH' : 'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }
  )
  
  return formatter.format(amount)
}

export function getExchangeRate(from: string, to: string): number {
  return MOCK_EXCHANGE_RATES[from]?.[to] || 1
}
