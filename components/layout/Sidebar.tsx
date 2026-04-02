'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const NavItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 20px', cursor: 'pointer',
        color: isActive(href) ? 'var(--accent)' : 'var(--text2)',
        fontSize: 13, fontWeight: isActive(href) ? 600 : 400,
        background: isActive(href) ? 'var(--accent-light)' : 'transparent',
        borderLeft: isActive(href) ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--text)' } }}
      onMouseLeave={(e) => { if (!isActive(href)) { e.currentTarget.style.color = 'var(--text2)' } }}
      >
        <span style={{ fontSize: 14, width: 20, textAlign: 'center', opacity: 0.7 }}>{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  )

  const SectionLabel = ({ label }: { label: string }) => (
    <p style={{ padding: '12px 20px 4px', fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</p>
  )

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>D</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>DCAport</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 12 }}>
        <SectionLabel label="Finance" />
        <NavItem href="/finance/dashboard" icon="◈" label="Dashboard" />

        <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

        <SectionLabel label="Invest" />
        <NavItem href="/invest/dashboard" icon="◉" label="Dashboard" />
        <NavItem href="/invest/allocate" icon="⊞" label="จัดสรรทุน" />
        <NavItem href="/invest/report" icon="▦" label="รายงาน DCA" />
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.user?.name ?? session?.user?.email ?? 'Guest'}
          </span>
          <button onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
          >ออก</button>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  )
}
