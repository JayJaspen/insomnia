'use client'
import { useEffect, useState } from 'react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Redan installerad som PWA → visa inte
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Redan visad denna session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)

    if (ios) {
      // iOS har inget beforeinstallprompt – visa manuell guide
      setTimeout(() => setShow(true), 2000)
      return
    }

    // Android/Chrome – fångar det inbyggda installationsprompten
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="glass border border-accent/40 rounded-2xl p-4 max-w-md mx-auto shadow-2xl"
           style={{ boxShadow: '0 -4px 30px rgba(83,52,131,0.3)' }}>
        <div className="flex items-start gap-3">
          <img src="/icons/icon-192.png" alt="Insomnia" className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-semibold text-sm">Installera Insomnia</p>
            <p className="text-text-muted text-xs mt-0.5">
              {isIos
                ? 'Tryck på delningsikonen \u{1F4E4} längst ner, välj sedan "Lägg till på hemskärmen".'
                : 'Lägg till som app på din hemskärm för snabbaste åtkomst.'
              }
            </p>
          </div>
          <button onClick={dismiss} className="text-text-muted hover:text-text-primary text-lg leading-none flex-shrink-0 p-1">
            ✕
          </button>
        </div>

        {!isIos && (
          <div className="flex gap-2 mt-3">
            <button onClick={dismiss}
              className="flex-1 py-2 rounded-xl text-sm text-text-muted border border-accent/20 hover:border-accent/40 transition-colors">
              Senare
            </button>
            <button onClick={install}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-accent-light hover:bg-accent transition-colors text-white">
              Installera
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
