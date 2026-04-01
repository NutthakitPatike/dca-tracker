'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    setIsSubmitting(false)

    if (result?.error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <h1 className="text-2xl font-semibold text-slate-950">เข้าสู่ระบบ DCAport</h1>
          <p className="mt-2 text-sm text-slate-500">ใช้บัญชีของคุณเพื่อจัดการรายรับ รายจ่าย และพอร์ตลงทุน</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ยังไม่มีบัญชี?{' '}
            <Link href="/auth/signup" className="font-semibold text-sky-600 hover:text-sky-700">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
