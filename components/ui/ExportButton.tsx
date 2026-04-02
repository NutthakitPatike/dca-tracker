'use client'

import { useState } from 'react'

export default function ExportButton({ 
  onExport, 
  filename, 
  isLoading = false 
}: { 
  onExport: () => void
  filename: string
  isLoading?: boolean 
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onExport}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '8px 16px',
        background: isLoading ? 'var(--surface2)' : isHovered ? 'var(--accent)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        color: isLoading ? 'var(--muted)' : isHovered ? '#fff' : 'var(--text)',
        fontSize: 12,
        fontWeight: 500,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1
      }}
    >
      <span style={{ fontSize: 14 }}>
        {isLoading ? '⏳' : '📊'}
      </span>
      <span>
        {isLoading ? 'กำลังสร้าง...' : `Export ${filename}`}
      </span>
    </button>
  )
}
