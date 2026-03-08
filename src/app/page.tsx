'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isServiceOpen, secondsUntilOpen } from '@/lib/utils'
import AdBanner from '@/components/AdBanner'

function Stars() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left:   `${Math.random() * 100}%`,
            top:    `${Math.random() * 100}%`,
            '--dur':   `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 4}s`,
            width:  `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            opacity: Math.random() * 0.7 + 0.1,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function CountdownClock({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const Unit = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="glass px-5 py-4 text-5xl md:text-7xl font-bold text-accent-glow tabular-nums min-w-[100px] text-center"
           style={{ textShadow: '0 0 30px rgba(83,52,131,0.8)' }}>
        {value}
      </div>
      <span className="text-text-muted text-sm mt-2 tracking-widest uppercase">{label}</span>
    </div>
  )

  return (
    <div className="flex gap-4 items-center justify-center">
      <Unit value={pad(h)} label="timmar" />
      <span className="text-4xl text-accent-light font-bold mb-6">:</span>
      <Unit value={pad(m)} label="minuter" />
      <span className="text-4xl text-accent-light font-bold mb-6">:</span>
      <Unit value={pad(s)} label="sekunder" />
    </div>
  )
}

export default function HomePage() {
  const [open, setOpen] = useState(false)
  const [secs, setSecs] = useState(0)
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search) : null

  useEffect(() => {
    const update = () => {
      const o = isServiceOpen()
      setOpen(o)
      if (!o) setSecs(secondsUntilOpen())
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <Stars />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logotyp */}
        <h1
          className="text-6xl md:text-8xl font-bold mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #533483, #0F3460, #7B52AB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}
        >
          insomnia
        </h1>

        {/* Tagline */}
        <p className="text-text-muted text-lg md:text-xl mb-12 leading-relaxed">
          Kan du inte sova?<br />
          <span className="text-text-primary font-medium">Du är inte ensam.</span><br />
          Välkommen in i värmen.
        </p>

        {open ? (
          /* ── Service är ÖPPET ── */
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30
                            text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Öppet nu – 22:00 till 06:00
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-primary text-center">
                Logga in
              </Link>
              <Link href="/register" className="btn-secondary text-center">
                Registrera dig
              </Link>
            </div>

            {params?.has('blocked') && (
              <p className="text-danger text-sm mt-4">
                Ditt konto har spärrats. Kontakta admin vid frågor.
              </p>
            )}
          </div>
        ) : (
          /* ── Service är STÄNGT – visa nedräkning ── */
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-danger/10 border border-danger/30
                            text-danger px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-danger" />
              Stängt just nu – öppnar kl. 22:00
            </div>

            <div>
              <p className="text-text-muted text-sm mb-6 tracking-widest uppercase">
                Öppnar om
              </p>
              <CountdownClock seconds={secs} />
            </div>

            <p className="text-text-muted text-sm">
              Du kan redan nu{' '}
              <Link href="/register" className="text-accent-light hover:underline">
                registrera ett konto
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      {/* CPM-banner – toppen */}
      <div className="relative z-10 mt-10 flex justify-center">
        <AdBanner slot="homepage-top" size="leaderboard" />
      </div>

      {/* ── Så fungerar Insomnia ── */}
      <section
        className="relative z-10 max-w-2xl mx-auto mt-10 mb-4 px-4"
        aria-label="Så fungerar Insomnia"
      >
        <div className="glass p-7 rounded-2xl space-y-5">
          <h2 className="text-text-primary font-bold text-xl text-center">
            Så fungerar Insomnia
          </h2>

          {/* Funktionskort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-card/60 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">🌙</span>
              <div>
                <p className="text-text-primary text-sm font-medium mb-1">Mötesplats för nattugglor</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Insomnia är till för dig som av någon anledning inte kan sova.
                  Skapa nya bekantskaper och hitta någon att prata med.
                </p>
              </div>
            </div>
            <div className="bg-bg-card/60 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">💬</span>
              <div>
                <p className="text-text-primary text-sm font-medium mb-1">Privat eller grupp</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Chatta privat med en person eller skapa gruppchattar med
                  olika ämnen öppna för alla inloggade.
                </p>
              </div>
            </div>
            <div className="bg-bg-card/60 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">🖼️</span>
              <div>
                <p className="text-text-primary text-sm font-medium mb-1">Dela bilder & umgås</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Du kan dela bilder i chatten och umgås precis som du vill —
                  anonymt och utan krav.
                </p>
              </div>
            </div>
            <div className="bg-bg-card/60 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">🔒</span>
              <div>
                <p className="text-text-primary text-sm font-medium mb-1">Raderas kl. 06:00</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  När tjänsten stänger varje morgon raderas alla chattar och bilder.
                  Dina bekantskaper finns alltid kvar.
                </p>
              </div>
            </div>
          </div>

          {/* Kontaktinfo */}
          <p className="text-text-muted text-xs text-center leading-relaxed border-t border-accent/10 pt-4">
            Har du frågor eller funderingar är du välkommen att höra av dig till oss på{' '}
            <a
              href="mailto:info@insomnia.nu"
              className="text-accent-light hover:underline"
            >
              info@insomnia.nu
            </a>
            .
          </p>
        </div>
      </section>

      {/* CPM-banner – botten */}
      <div className="relative z-10 mb-16 flex justify-center px-4">
        <AdBanner slot="homepage-bottom" size="leaderboard" />
      </div>

      {/* Fotnot */}
      <footer className="absolute bottom-2 text-text-muted text-xs text-center z-10 w-full">
        insomnia.nu &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Öppet 22:00–06:00
      </footer>
    </div>
  )
}
