'use client'

import { useState } from 'react'
import Link from 'next/link'

const inp: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.7px' }

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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '44px 36px', width: '100%', maxWidth: 380, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', marginBottom: 6, background: 'linear-gradient(135deg, #818cf8, #22d3a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DCAport</div>
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
          {error && <p style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red2)', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '11px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 1px 10px rgba(99,102,241,0.3)', opacity: loading ? 0.5 : 1, marginTop: 4 }}>
            {loading ? '⟳ กำลังสมัคร…' : 'สมัครสมาชิก'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          มีบัญชีแล้ว?{' '}
          <Link href="/auth/signin" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
        </p>
      </div>
    </main>
  )
}
