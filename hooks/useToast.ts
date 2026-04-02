import { useCallback, useState } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number // ms, default 3000
}

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000) => {
    const id = `toast-${++counter}`
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Shorthand helpers
  const success = useCallback((msg: string) => show(msg, 'success'), [show])
  const error   = useCallback((msg: string) => show(msg, 'error'), [show])
  const info    = useCallback((msg: string) => show(msg, 'info'), [show])

  return { toasts, show, remove, success, error, info }
}
