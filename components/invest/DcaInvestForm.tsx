'use client'

import { useState } from 'react'

const inp: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', transition: 'border-color 0.15s' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.7px' }

export default function DcaInvestForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setStatus(null); setSaving(true)
    try {
      const res = await fetch('/api/dca/invest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount), date }) })
      const result = await res.json()
      if (!res.ok) { setStatus({ type: 'err', msg: result.error || 'เกิดข้อผิดพลาด' }) }
      else { setStatus({ type: 'ok', msg: '✓ ลงทุน DCA เรียบร้อยแล้ว' }); setAmount(''); onSuccess() }
    } catch { setStatus({ type: 'err', msg: 'เชื่อมต่อไม่ได้' }) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 4 }}>ลงทุน DCA อัตโนมัติ</p>
        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>บันทึกตามน้ำหนักที่กำหนด</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={lbl}>จำนวนเงินลงทุน ($)</label>
          <input style={inp} type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={lbl}>วันที่</label>
          <input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {status && (
          <div style={{ borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 13, border: '1px solid', background: status.type === 'ok' ? 'var(--green2)' : 'var(--red2)', borderColor: status.type === 'ok' ? 'rgba(34,211,160,0.25)' : 'rgba(248,113,113,0.25)', color: status.type === 'ok' ? 'var(--green)' : 'var(--red)' }}>
            {status.msg}
          </div>
        )}

        <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 1px 10px rgba(99,102,241,0.3)', opacity: saving ? 0.5 : 1 }}>
          {saving ? '⟳ กำลังบันทึก…' : '⚡ บันทึก DCA ตามสัดส่วน'}
        </button>
      </form>
    </div>
  )
}
