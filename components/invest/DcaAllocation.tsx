'use client'

import { useEffect, useState } from 'react'

interface DcaAsset { symbol: string; name: string; weight: number; currentPrice: number | null }

const symbolColors: Record<string, string> = { SCHG: '#38bdf8', SMH: '#818cf8', AVUV: '#22d3a0', GLDM: '#fbbf24' }
const getColor = (sym: string) => symbolColors[sym.toUpperCase()] ?? 'var(--accent2)'

export default function DcaAllocation() {
  const [assets, setAssets] = useState<DcaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dca')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => setAssets(d.assets))
      .catch(() => setError('ไม่สามารถเชื่อมต่อ Finnhub ได้'))
      .finally(() => setLoading(false))
  }, [])

  const totalWeight = assets.reduce((s, a) => s + a.weight, 0)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 4 }}>DCA Basket</p>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>จัดสรรพอร์ต 4 สัญลักษณ์</h2>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: 'rgba(99,102,241,0.12)', color: 'var(--accent2)' }}>
          Finnhub live
        </span>
      </div>

      {/* Allocation bar */}
      {!loading && !error && assets.length > 0 && (
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2, marginBottom: 20 }}>
          {assets.map((a) => (
            <div key={a.symbol} style={{ flex: a.weight / totalWeight, background: getColor(a.symbol), borderRadius: 3 }} />
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>⟳ กำลังดึงราคา…</p>
      ) : error ? (
        <div style={{ borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: 13, border: '1px solid', background: 'var(--amber2)', borderColor: 'rgba(251,191,36,0.25)', color: 'var(--amber)' }}>
          ⚠ {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assets.map((asset) => {
            const color = getColor(asset.symbol)
            const pct = Math.round(asset.weight * 100)
            return (
              <div key={asset.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>{asset.symbol} <span style={{ color: 'var(--muted)', fontSize: 12 }}>— {asset.name}</span></span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 72, textAlign: 'right' }}>
                  {asset.currentPrice !== null ? `$${asset.currentPrice.toFixed(2)}` : <span style={{ color: 'var(--muted)' }}>—</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
