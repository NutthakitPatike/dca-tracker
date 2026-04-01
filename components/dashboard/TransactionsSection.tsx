'use client'

import { useMemo, useState } from 'react'
import type { Transaction } from '@/types/finance'
import { formatMoney } from '@/lib/metrics'

const incomeCategories = ['เงินเดือน', 'โบนัส', 'ดอกเบี้ย', 'อื่นๆ']
const expenseCategories = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สาธารณูปโภค', 'บันเทิง', 'อื่นๆ']

interface TransactionsSectionProps {
  transactions: Transaction[]
  loading: boolean
  onReload: () => Promise<void>
}

export default function TransactionsSection({ transactions, loading, onReload }: TransactionsSectionProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(incomeCategories[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const totalTransactions = useMemo(() => transactions.length, [transactions])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: Number(amount), category, note, date }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'ไม่สามารถบันทึกรายการได้')
      }
      setAmount('')
      setNote('')
      setCategory(type === 'INCOME' ? incomeCategories[0] : expenseCategories[0])
      setType('INCOME')
      await onReload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'ไม่สามารถลบรายการได้')
      }
      await onReload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">ระบบรายรับ-รายจ่าย</h2>
          <p className="text-sm text-slate-500">บันทึกรายรับ รายจ่าย และดูประวัติรายการทั้งหมดได้ที่นี่.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{totalTransactions} รายการ</span>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as 'INCOME' | 'EXPENSE'
              setType(nextType)
              setCategory(nextType === 'INCOME' ? incomeCategories[0] : expenseCategories[0])
            }}
          >
            <option value="INCOME">รายรับ</option>
            <option value="EXPENSE">รายจ่าย</option>
          </select>
          <input
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            type="number"
            step="0.01"
            placeholder="จำนวนเงิน"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <select
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            {(type === 'INCOME' ? incomeCategories : expenseCategories).map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <button
            className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'กำลังบันทึก…' : 'เพิ่มรายการ'}
          </button>
        </div>

        <textarea
          className="min-h-[96px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </form>

      {actionError && <p className="mt-4 text-sm text-rose-600">{actionError}</p>}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-slate-500">วันที่</th>
              <th className="pb-2 text-slate-500">หมวดหมู่</th>
              <th className="pb-2 text-slate-500">จำนวนเงิน</th>
              <th className="pb-2 text-slate-500">ประเภท</th>
              <th className="pb-2 text-slate-500">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="rounded-3xl bg-slate-50">
                <td className="py-3 pr-4">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="py-3 pr-4">{transaction.category}</td>
                <td className="py-3 pr-4 font-semibold text-slate-950">{formatMoney(Number(transaction.amount))}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${transaction.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {transaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">กำลังอัปเดตข้อมูล…</p>}
    </div>
  )
}
