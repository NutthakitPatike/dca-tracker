'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      setError(result.error ?? 'ไม่สามารถสมัครสมาชิกได้')
      return
    }

    setSuccess('สมัครสมาชิกเรียบร้อยแล้ว! ไปยังหน้าล็อกอินต่อ')
    setTimeout(() => router.push('/auth/signin'), 1200)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <h1 className="text-2xl font-semibold text-slate-950">สมัครสมาชิก DCAport</h1>
          <p className="mt-2 text-sm text-slate-500">สร้างบัญชีใหม่เพื่อเริ่มติดตามการเงินและการลงทุนของคุณ</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">ชื่อ</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                required
              />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังสมัครสมาชิก…' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            มีบัญชีแล้ว?{' '}
            <Link href="/auth/signin" className="font-semibold text-sky-600 hover:text-sky-700">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
