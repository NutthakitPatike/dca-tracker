'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/finance', icon: '◈', label: 'ภาพรวม', section: 'FINANCE' },
  { href: '/finance/transactions', icon: '↕', label: 'รายการ', section: null },
  { href: '/invest', icon: '◉', label: 'พอร์ต DCA', section: 'INVEST' },
  { href: '/invest/allocate', icon: '⊞', label: 'จัดสรรทุน', section: null },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Accent bar top */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--accent), #38bdf8, #22d3a0)', opacity: 0.7, flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>D</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.4px' }}>DCAport</span>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--muted)', letterSpacing: '0.2px' }}>v0.1 · personal finance</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 0' }}>
        {navItems.map((item, i) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <div key={item.href}>
              {item.section && (
                <p style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: i > 0 ? 8 : 0 }}>
                  {item.section}
                </p>
              )}
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 16px', cursor: 'pointer',
                  color: isActive ? 'var(--accent2)' : 'var(--text2)',
                  fontSize: 13, fontWeight: 500,
                  borderRadius: 'var(--radius)',
                  margin: '1px 8px',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  position: 'relative',
                  transition: 'all 0.12s',
                }}>
                  {isActive && (
                    <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--accent)', borderRadius: '0 3px 3px 0' }} />
                  )}
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', opacity: 0.8 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            </div>
          )
        })}
      </nav>

      {/* User bar */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>
          {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session?.user?.name ?? session?.user?.email ?? 'Guest'}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 5, fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.12s' }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--red)'; (e.target as HTMLElement).style.background = 'var(--red2)' }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)'; (e.target as HTMLElement).style.background = 'none' }}
        >
          ออก
        </button>
      </div>
    </aside>
  )
}
