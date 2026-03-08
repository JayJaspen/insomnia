'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isServiceOpen, secondsUntilOpen } from '@/lib/utils'

function Stars() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left:    `${Math.random() * 100}%`,
            top:     `${Math.random() * 100}%`,
            '--dur':   `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 4}s`,
            width:   `${1 + Math.random() * 2}px`,
            height:  `${1 + Math.random() * 2}px`,
            opacity: Math.random() * 0.7 + 0.1,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function CountdownClock({ seconds }: { seconds: number }) {
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const Unit = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="glass px-5 py-4 text-5xl md:text-7xl font-bold text-accent-glow tabular-nums min-w-[100px] text-center"
        style={{ textShadow: '0 0 30px rgba(83,52,131,0.8)' }}
      >
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

export default function HomeHero() {
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
    <>
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
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30
                            text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Öppet nu – 22:00 till 06:00
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login"    className="btn-primary text-center">Logga in</Link>
              <Link href="/register" className="btn-secondary text-center">Registrera dig</Link>
            </div>
            {params?.has('blocked') && (
              <p className="text-danger text-sm mt-4">
                Ditt konto har spärrats. Kontakta admin vid frågor.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-danger/10 border border-danger/30
                            text-danger px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-danger" />
              Stängt just nu – öppnar kl. 22:00
            </div>
            <div>
              <p className="text-text-muted text-sm mb-6 tracking-widest uppercase">Öppnar om</p>
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
    </>
  )
}
