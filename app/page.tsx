'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ✅ FIX: เพิ่ม session check
// เดิม: ปุ่ม "เข้าสู่แดชบอร์ด" ไปตรงๆ โดยไม่เช็ค login
// ใหม่: ถ้า login แล้ว → redirect ไป /finance/dashboard ทันที
//        ถ้ายังไม่ login → แสดงหน้า landing พร้อมปุ่มไปหน้า signin
export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/finance/dashboard')
    }
  }, [status, router])

  // กำลัง check session — แสดง loading เบาๆ ไม่ให้หน้ากระตุก
  if (status === 'loading' || status === 'authenticated') {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'var(--bg2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>
          กำลังโหลด…
        </p>
      </main>
    )
  }

  // ยังไม่ได้ login → แสดงหน้า landing
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
    }}>
      <div style={{ width: 'min(100%, 960px)', display: 'grid', gridTemplateColumns: 'minmax(280px,340px) 1fr', gap: 28, alignItems: 'stretch' }}>

        {/* Login box */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6, color: 'var(--text)' }}>
            DCAport
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32, lineHeight: 1.7 }}>
            ติดตามพอร์ต ETF · บันทึกรายรับ-รายจ่าย · ดู P&amp;L แบบ real-time
          </p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '0 0 32px', color: 'var(--text2)', textAlign: 'left' }}>
            {[
              'บันทึก DCA อัตโนมัติตาม % allocation',
              'ติดตาม Unrealized P&L ทุก ETF',
              'ระบบรายรับ-รายจ่ายพร้อม pagination',
            ].map((item) => (
              <li key={item} style={{ marginBottom: 12, paddingLeft: 22, position: 'relative', fontSize: 13 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>•</span>
                {item}
              </li>
            ))}
          </ul>

          {/* ✅ FIX: ปุ่มชี้ไปที่ /auth/signin แทนหน้า dashboard โดยตรง */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/auth/signin" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px',
              background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              เข้าสู่ระบบ
            </Link>
            <Link href="/auth/signup" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px',
              background: 'var(--bg)', color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              สมัครสมาชิก
            </Link>
          </div>
        </div>

        {/* Preview panel */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '1px', textTransform: 'uppercase' }}>ตัวอย่างแดชบอร์ด</p>
          {[
            { label: 'Portfolio Value',   value: '$12,340',          color: 'var(--text)' },
            { label: 'Unrealized P&L',    value: '+$1,250 (11.28%)', color: 'var(--green)' },
            { label: 'ยอดคงเหลือ',        value: '฿42,500',          color: 'var(--text)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
              <span>{label}</span>
              <strong style={{ color }}>{value}</strong>
            </div>
          ))}
          <div style={{ background: 'var(--surface2)', height: 120, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'var(--accent-light)' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            ข้อมูลทั้งหมดเก็บบนฐานข้อมูลของคุณ — ปลอดภัยและเป็นส่วนตัว
          </p>
        </div>

      </div>
    </main>
  )
}
