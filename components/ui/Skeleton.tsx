'use client'

export function SkeletonBox({ width, height, style }: { width?: string | number; height?: string | number; style?: React.CSSProperties }) {
  return (
    <div className="skeleton" style={{ width: width ?? '100%', height: height ?? 20, ...style }} />
  )
}

export function SkeletonMetrics() {
  return (
    <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px 24px' }}>
          <SkeletonBox width={80} height={10} style={{ marginBottom: 14 }} />
          <SkeletonBox width={120} height={28} style={{ marginBottom: 8 }} />
          <SkeletonBox width={60} height={10} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <SkeletonBox width={160} height={12} style={{ marginBottom: 20 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SkeletonBox width={60} height={14} />
            <SkeletonBox width="40%" height={14} />
            <SkeletonBox width={80} height={14} />
            <SkeletonBox width={60} height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <SkeletonBox width={160} height={12} style={{ marginBottom: 20 }} />
      <SkeletonBox height={200} />
    </div>
  )
}
