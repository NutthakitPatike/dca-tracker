'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import type { Transaction } from '@/types/finance'
import TransactionsSection from '@/components/dashboard/TransactionsSection'

export default function FinanceShell() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/transactions')
      if (response.status === 401) {
        setError('กรุณาเข้าสู่ระบบก่อนดูข้อมูล')
        setTransactions([])
        return
      }
      const data = await response.json()
      setTransactions(data)
    } catch {
      setError('ไม่สามารถโหลดรายการได้ในขณะนี้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadTransactions().catch(console.error)
    }
  }, [status])

  if (status === 'loading') {
    return <div className="rounded-3xl bg-white p-8 shadow-panel">กำลังโหลด...</div>
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-950">กรุณาเข้าสู่ระบบ</h2>
        <p className="mt-2 text-slate-500">ลงชื่อเข้าใช้เพื่อเข้าถึงระบบรายรับ-รายจ่ายของคุณ</p>
        <button
          className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={() => signIn()}
        >
          เข้าสู่ระบบ
        </button>
      </div>
    )
  }

  return <TransactionsSection transactions={transactions} loading={loading} onReload={loadTransactions} />
}
