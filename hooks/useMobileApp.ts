import { useState, useEffect } from 'react'

export function useMobileApp() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if app is already installed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.scope.includes('twa')) {
          setIsInstalled(true)
        }
      })
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to install app:', error)
      return false
    }
  }

  const shareApp = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return true
      } catch (error) {
        console.error('Failed to share:', error)
        return false
      }
    }
    
    // Fallback for browsers that don't support Web Share API
    if (navigator.clipboard) {
      try {
        await (navigator.clipboard as any).writeText(`${title}\n${text}\n${url}`)
        return true
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
      }
    }
    
    return false
  }

  const addToHomeScreen = () => {
    // For iOS Safari
    if ('standalone' in navigator && !navigator.standalone) {
      return {
        instructions: [
          '1. คลิกปุ่ม Share ที่ด้านล่าง',
          '2. เลือก "Add to Home Screen"',
          '3. คลิก "Add" เพื่อติดตั้งแอป'
        ],
        platform: 'ios'
      }
    }
    
    // For Android Chrome
    if (deferredPrompt) {
      return {
        instructions: [
          'คลิกปุ่ม "Install App" ด้านล่าง',
          'หรือคลิกที่เมนู (⋮) แล้วเลือก "Install app"'
        ],
        platform: 'android'
      }
    }
    
    return null
  }

  return {
    isInstalled,
    isInstallable,
    installApp,
    shareApp,
    addToHomeScreen,
    deferredPrompt
  }
}
