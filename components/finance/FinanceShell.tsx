'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import TransactionsSection from '@/components/dashboard/TransactionsSection'

export default function FinanceShell() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

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

  return <TransactionsSection loading={loading} onReload={async () => {}} />
}
