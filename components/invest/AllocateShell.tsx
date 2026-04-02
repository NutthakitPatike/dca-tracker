'use client'

import DcaAllocation from './DcaAllocation'
import DcaInvestForm from './DcaInvestForm'
import { useState } from 'react'

export default function AllocateShell() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>จัดสรรทุน DCA</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>ดูสัดส่วนพอร์ตและบันทึกการลงทุนอัตโนมัติ</p>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        <DcaAllocation key={refreshKey} />
        <DcaInvestForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      </div>
    </div>
  )
}
