'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

const inp: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px' }

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false) }
    else window.location.href = '/finance/dashboard'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '48px 40px', width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>DCAport</div>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={lbl}>อีเมล</label>
            <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={lbl}>รหัสผ่าน</label>
            <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red2)', padding: '8px 12px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', opacity: loading ? 0.5 : 1, marginTop: 4 }}>
            {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          ยังไม่มีบัญชี?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>สมัครสมาชิก</Link>
        </p>
      </div>
    </main>
  )
}
