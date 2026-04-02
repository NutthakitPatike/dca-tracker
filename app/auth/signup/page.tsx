'use client'

import { useState } from 'react'
import Link from 'next/link'

const inp: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px' }

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'สมัครไม่ได้')
      window.location.href = '/auth/signin'
    } catch (err) { setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '48px 40px', width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>DCAport</div>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>สร้างบัญชีใหม่</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={lbl}>ชื่อ</label>
            <input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อของคุณ" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={lbl}>อีเมล</label>
            <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={lbl}>รหัสผ่าน</label>
            <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" minLength={6} required />
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red2)', padding: '8px 12px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', opacity: loading ? 0.5 : 1, marginTop: 4 }}>
            {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          มีบัญชีแล้ว?{' '}
          <Link href="/auth/signin" style={{ color: 'var(--accent)', textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
        </p>
      </div>
    </main>
  )
}
