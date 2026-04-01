'use client'

import { useState } from 'react'

interface DcaInvestFormProps {
  onSuccess: () => void
}

export default function DcaInvestForm({ onSuccess }: DcaInvestFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setSaving(true)

    try {
      const response = await fetch('/api/dca/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), date }),
      })
      const result = await response.json()
      if (!response.ok) {
        setStatus(result.error || 'เกิดข้อผิดพลาดในการลงทุน DCA')
      } else {
        setStatus('ลงทุน DCA เรียบร้อยแล้ว ตามสัดส่วนที่กำหนด')
        setAmount('')
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      setStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">ลงทุน DCA อัตโนมัติ</p>
        <h2 className="text-2xl font-semibold text-slate-950">บันทึกการลงทุนตามน้ำหนัก</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="number"
            step="0.01"
            min="0"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            placeholder="จำนวนเงินลงทุน"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <input
            type="date"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก…' : 'บันทึก DCA ตามสัดส่วน'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
    </div>
  )
}
