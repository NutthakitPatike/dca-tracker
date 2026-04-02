'use client'

import { useEffect, useRef } from 'react'
import type { Toast } from '@/hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const ICONS: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'i',
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container" aria-live="polite" aria-label="การแจ้งเตือน">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      // ใส่ class removing ก่อน เพื่อเล่น animation ออก
      elRef.current?.classList.add('removing')
      setTimeout(() => onRemove(toast.id), 200)
    }, toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  return (
    <div
      ref={elRef}
      className={`toast toast-${toast.type}`}
      role="status"
      onClick={() => onRemove(toast.id)}
      style={{ cursor: 'pointer' }}
      title="คลิกเพื่อปิด"
    >
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  )
}
