'use client'
import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | null

export default function InstallBanner() {
  const [show, setShow]               = useState(false)
  const [platform, setPlatform]       = useState<Platform>(null)
  const [deferredPrompt, setDeferred] = useState<any>(null)
  const [visible, setVisible]         = useState(false)

  useEffect(() => {
    // Redan installerad som PWA – visa inte
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Redan stängd denna session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return

    const ua = navigator.userAgent
    const ios     = /iphone|ipad|ipod/i.test(ua)
    const android = /android/i.test(ua)
    const mobile  = ios || android

    // Visa bara på mobil
    if (!mobile) return

    setPlatform(ios ? 'ios' : 'android')

    if (ios) {
      // iOS: inget beforeinstallprompt – visa alltid manuell guide
      setTimeout(() => { setShow(true); setTimeout(() => setVisible(true), 50) }, 1500)
      return
    }

    // Android: väntar på Chrome-prompten
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setTimeout(() => { setShow(true); setTimeout(() => setVisible(true), 50) }, 1500)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('pwa-banner-dismissed', '1')
    }, 400)
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferred(null)
    }
    dismiss()
  }

  if (!show) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 p-3"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="glass border border-accent/40 rounded-2xl p-4 max-w-md mx-auto shadow-2xl"
        style={{ boxShadow: '0 8px 40px rgba(83,52,131,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/icons/icon-192.png"
            alt="Insomnia"
            className="w-10 h-10 rounded-xl flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-text-primary font-semibold text-sm">
              Installera Insomnia
            </p>
            <p className="text-text-muted text-xs">
              Lägg till på hemskärmen för snabb åtkomst varje natt
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Stäng"
            className="text-text-muted hover:text-text-primary text-base leading-none p-1 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Instruktioner per plattform */}
        {platform === 'ios' && (
          <div className="bg-bg-card/60 rounded-xl p-3 space-y-2 text-xs text-text-muted">
            <p className="text-text-primary font-medium text-xs mb-1">
              📱 iPhone / iPad – gör så här:
            </p>
            <ol className="space-y-1.5 list-decimal list-inside">
              <li>
                Öppna sidan i{' '}
                <span className="text-accent-light font-semibold">Safari</span>
                {' '}(fungerar ej i Chrome eller Firefox på iOS)
              </li>
              <li>
                Tryck på delningsikonen{' '}
                <span className="text-accent-light">⬆</span>{' '}
                längst ner i webbläsaren
              </li>
              <li>
                Välj{' '}
                <span className="text-accent-light font-semibold">
                  "Lägg till på hemskärmen"
                </span>
              </li>
            </ol>
          </div>
        )}

        {platform === 'android' && !deferredPrompt && (
          <div className="bg-bg-card/60 rounded-xl p-3 space-y-2 text-xs text-text-muted">
            <p className="text-text-primary font-medium text-xs mb-1">
              🤖 Android – gör så här:
            </p>
            <ol className="space-y-1.5 list-decimal list-inside">
              <li>
                Öppna sidan i{' '}
                <span className="text-accent-light font-semibold">Chrome</span>
                {' '}(fungerar även i Samsung Internet)
              </li>
              <li>
                Tryck på menyn{' '}
                <span className="text-accent-light font-semibold">⋮</span>{' '}
                uppe till höger
              </li>
              <li>
                Välj{' '}
                <span className="text-accent-light font-semibold">
                  "Installera app"
                </span>
                {' '}eller{' '}
                <span className="text-accent-light font-semibold">
                  "Lägg till på hemskärmen"
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Android med native Chrome-prompt */}
        {platform === 'android' && deferredPrompt && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={dismiss}
              className="flex-1 py-2 rounded-xl text-sm text-text-muted border border-accent/20 hover:border-accent/40 transition-colors"
            >
              Senare
            </button>
            <button
              onClick={install}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-accent-light hover:bg-accent transition-colors text-white"
            >
              Installera nu
            </button>
          </div>
        )}

        {/* iOS: bara stäng-knapp */}
        {platform === 'ios' && (
          <button
            onClick={dismiss}
            className="w-full mt-3 py-2 rounded-xl text-sm text-text-muted border border-accent/20 hover:border-accent/40 transition-colors"
          >
            Förstår, stäng
          </button>
        )}
      </div>
    </div>
  )
}
