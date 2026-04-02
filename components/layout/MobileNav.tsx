'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/finance/dashboard', icon: '◈', label: 'Finance' },
  { href: '/invest/dashboard', icon: '◉', label: 'Invest' },
  { href: '/invest/allocate', icon: '⊞', label: 'จัดสรร' },
  { href: '/invest/report', icon: '▦', label: 'รายงาน' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="mobile-nav">
      {navItems.map(({ href, icon, label }) => (
        <Link key={href} href={href} className={isActive(href) ? 'active' : ''}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
      <div style={{ padding: '8px 12px' }}>
        <ThemeToggle compact />
      </div>
    </nav>
  )
}
