'use client'

import { useSession, signIn } from 'next-auth/react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--muted)' }}>กำลังโหลด…</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '44px 36px', textAlign: 'center', maxWidth: 360, width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8, background: 'linear-gradient(135deg, #818cf8, #22d3a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DCAport</div>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28 }}>กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => signIn()} style={{ padding: '12px 20px', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 10px rgba(99,102,241,0.3)' }}>
              เข้าสู่ระบบ
            </button>
            <button onClick={() => window.location.href = '/auth/signup'} style={{ padding: '12px 20px', borderRadius: 'var(--radius)', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border3)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              สมัครสมาชิก
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg2)', position: 'relative' }}>
        {/* Subtle grid */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px', maxWidth: 960, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
