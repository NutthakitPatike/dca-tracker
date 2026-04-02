import { useState, useEffect } from 'react'
import { getExchangeRate } from '@/lib/exchange-rate'

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(35)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchRate = async () => {
      try {
        setLoading(true)
        setError(null)
        const currentRate = await getExchangeRate()
        if (mounted) {
          setRate(currentRate)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch exchange rate')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchRate()

    // Refresh rate every 5 minutes
    const interval = setInterval(fetchRate, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { rate, loading, error }
}
