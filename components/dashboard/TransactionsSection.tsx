'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatMoney } from '@/lib/metrics'

const incomeCategories = ['เงินเดือน', 'โบนัส', 'ดอกเบี้ย', 'อื่นๆ']
const expenseCategories = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สาธารณูปโภค', 'บันเทิง', 'อื่นๆ']

interface Transaction { id: string; type: 'INCOME' | 'EXPENSE'; amount: string | number; category: string; note?: string; date: string }
interface PagedResult { items: Transaction[]; total: number; page: number; pageSize: number; totalPages: number }
interface Props { loading: boolean; onReload: () => Promise<void> }

const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }
const inp: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', transition: 'border-color 0.15s' }

export default function TransactionsSection({ loading: parentLoading, onReload }: Props) {
  const [data, setData] = useState<PagedResult>({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [fetching, setFetching] = useState(false)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(incomeCategories[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchPage = useCallback(async (p: number) => {
    setFetching(true)
    try {
      const res = await fetch(`/api/transactions?page=${p}&pageSize=20`)
      if (res.ok) { setData(await res.json()); setPage(p) }
    } finally { setFetching(false) }
  }, [])

  useEffect(() => { fetchPage(1) }, [fetchPage])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsSaving(true); setActionError(null)
    try {
      const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, amount: Number(amount), category, note, date }) })
      if (!res.ok) throw new Error((await res.json()).error || 'บันทึกไม่ได้')
      setAmount(''); setNote(''); setCategory(incomeCategories[0]); setType('INCOME')
      await fetchPage(1); await onReload()
    } catch (err) { setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('ลบไม่ได้')
      await fetchPage(page); await onReload()
    } catch (err) { setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px', marginBottom: 4 }}>รายรับ — รายจ่าย</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>บันทึกและติดตามกระแสเงินสดรายวัน</p>
      </div>

      {/* Add form card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px' }}>เพิ่มรายการใหม่</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={formGroup}>
              <label style={label}>ประเภท</label>
              <select style={inp} value={type} onChange={(e) => { const t = e.target.value as 'INCOME'|'EXPENSE'; setType(t); setCategory(t === 'INCOME' ? incomeCategories[0] : expenseCategories[0]) }}>
                <option value="INCOME">รายรับ</option>
                <option value="EXPENSE">รายจ่าย</option>
              </select>
            </div>
            <div style={formGroup}>
              <label style={label}>จำนวนเงิน</label>
              <input style={inp} type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div style={formGroup}>
              <label style={label}>หมวดหมู่</label>
              <select style={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
                {(type === 'INCOME' ? incomeCategories : expenseCategories).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={formGroup}>
              <label style={label}>วันที่</label>
              <input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div style={formGroup}>
            <label style={label}>หมายเหตุ (ไม่บังคับ)</label>
            <input style={inp} placeholder="ระบุรายละเอียด…" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {actionError && <p style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
            <button type="submit" disabled={isSaving} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', boxShadow: '0 1px 10px rgba(99,102,241,0.3)', opacity: isSaving ? 0.5 : 1 }}>
              {isSaving ? '⟳ กำลังบันทึก…' : '+ เพิ่มรายการ'}
            </button>
          </div>
        </form>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px' }}>ประวัติรายการ</p>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 5, padding: '2px 9px' }}>{data.total} รายการ</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['วันที่', 'หมวดหมู่', 'หมายเหตุ', 'จำนวนเงิน', 'ประเภท', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 12px 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => { td.style.background = 'rgba(255,255,255,0.015)'; td.style.color = 'var(--text)' })}
                  onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach(td => { td.style.background = ''; td.style.color = '' })}
                >
                  <td style={{ padding: '11px 12px', color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                  <td style={{ padding: '11px 12px', color: 'var(--text2)' }}>{tx.category}</td>
                  <td style={{ padding: '11px 12px', color: 'var(--muted)', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || '—'}</td>
                  <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.type === 'INCOME' ? '+' : '−'}{formatMoney(Number(tx.amount))}
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: tx.type === 'INCOME' ? 'var(--green2)' : 'var(--red2)', color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                      {tx.type === 'INCOME' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    <button onClick={() => handleDelete(tx.id)} style={{ padding: '5px 11px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--red2)', color: 'var(--red)', border: '1px solid transparent', fontFamily: "'Space Grotesk',sans-serif" }}>ลบ</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && !fetching && (
                <tr><td colSpan={6} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--muted)' }}>ยังไม่มีรายการ</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button disabled={page <= 1} onClick={() => fetchPage(page - 1)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>← ก่อนหน้า</button>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)' }}>หน้า {page} / {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => fetchPage(page + 1)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: page >= data.totalPages ? 'not-allowed' : 'pointer', opacity: page >= data.totalPages ? 0.4 : 1 }}>ถัดไป →</button>
          </div>
        )}
        {(fetching || parentLoading) && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>⟳ กำลังโหลด…</p>}
      </div>
    </div>
  )
}
