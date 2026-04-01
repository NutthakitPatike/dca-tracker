'use client'

import { useEffect, useState } from 'react'

interface DcaAsset {
  symbol: string
  name: string
  weight: number
  currentPrice: number | null
}

export default function DcaAllocation() {
  const [assets, setAssets] = useState<DcaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssets = async () => {
      setError(null)
      setLoading(true)
      try {
        const response = await fetch('/api/dca')
        if (!response.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูล DCA ได้')
        }
        const data = await response.json()
        setAssets(data.assets)
      } catch (err) {
        console.error(err)
        setError('ไม่สามารถเชื่อมต่อ Finnhub ได้ ลองรีเฟรชอีกครั้ง')
      } finally {
        setLoading(false)
      }
    }

    loadAssets().catch(console.error)
  }, [])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">DCA Basket</p>
          <h2 className="text-2xl font-semibold text-slate-950">4 สัญลักษณ์ตามสะดวก</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Finnhub live quote
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-500">จัดพอร์ตด้วยสัดส่วนที่กำหนด: SCHG 40%, SMH 30%, AVUV 20%, GLDM 10%.</p>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">กำลังดึงราคา...</p>
      ) : error ? (
        <div className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="mt-6 space-y-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div>
                <p className="text-sm font-semibold text-slate-950">{asset.symbol}</p>
                <p className="text-sm text-slate-500">{asset.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">น้ำหนัก</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{Math.round(asset.weight * 100)}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ราคา</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{asset.currentPrice !== null ? `$${asset.currentPrice.toFixed(2)}` : 'ไม่พบราคา'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
