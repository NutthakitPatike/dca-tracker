'use client'

import { useSession, signIn } from 'next-auth/react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>กำลังโหลด…</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '48px 40px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8, color: 'var(--text)' }}>DCAport</div>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 32 }}>กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => signIn()} style={{ padding: '12px 20px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>เข้าสู่ระบบ</button>
            <button onClick={() => window.location.href = '/auth/signup'} style={{ padding: '12px 20px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>สมัครสมาชิก</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="app-sidebar">
        <Sidebar />
      </div>
      <main className="app-main" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg2)', minWidth: 0 }}>
        <div style={{ padding: '32px 40px' }}>
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
