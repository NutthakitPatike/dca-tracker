'use client'

import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        style={{
          padding: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text)'
        }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        color: 'var(--text)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.color = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text)'
      }}
    >
      {theme === 'light' ? (
        <>
          <span style={{ fontSize: 14 }}>🌙</span>
          <span>Dark</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 14 }}>☀️</span>
          <span>Light</span>
        </>
      )}
    </button>
  )
}
