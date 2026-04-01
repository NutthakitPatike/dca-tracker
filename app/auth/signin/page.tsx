'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

const inp: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', transition: 'border-color 0.15s, box-shadow 0.15s' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.7px' }

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false) }
    else window.location.href = '/finance'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '44px 36px', width: '100%', maxWidth: 380, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', marginBottom: 6, background: 'linear-gradient(135deg, #818cf8, #22d3a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DCAport</div>
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
          {error && <p style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red2)', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '11px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 1px 10px rgba(99,102,241,0.3)', opacity: loading ? 0.5 : 1, marginTop: 4 }}>
            {loading ? '⟳ กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          ยังไม่มีบัญชี?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>สมัครสมาชิก</Link>
        </p>
      </div>
    </main>
  )
}
