import type { Metadata } from 'next'
import Link from 'next/link'
import HomeHero from '@/components/HomeHero'
import AdBanner from '@/components/AdBanner'

export const metadata: Metadata = {
  title: 'Insomnia.nu – Kan du inte sova? Chatta med andra nattugglor',
  description:
    'Lider du av sömnproblem eller sömnlöshet? På Insomnia.nu kan du chatta anonymt med andra som också är vakna på natten. Öppet 22:00–06:00 varje natt. Du är inte ensam.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">

      {/* Interaktiv del (klient): stjärnor, logo, nedräkning, knappar */}
      <HomeHero />

      {/* CPM-banner – toppen */}
      <div className="relative z-10 mt-10 flex justify-center w-full">
        <AdBanner slot="homepage-top" size="leaderboard" />
      </div>

      {/* ── Så fungerar Insomnia ─────────────────────────────────────────
          Server-renderat block – Google indexerar detta direkt utan JS.
          Innehåller de viktigaste SEO-nyckelorden.
      ─────────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 max-w-2xl mx-auto mt-10 mb-4 px-4 w-full"
        aria-label="Så fungerar Insomnia"
      >
        <div className="glass p-7 rounded-2xl space-y-5">
          <h2 className="text-text-primary font-bold text-xl text-center">
            Så fungerar Insomnia
          </h2>

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
                <p className="text-text-primary text-sm font-medium mb-1">Dela bilder &amp; umgås</p>
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

          {/* SEO-text – nyckelfraser för Google, naturlig text för besökare */}
          <div className="border-t border-accent/10 pt-4 space-y-2 text-text-muted text-xs leading-relaxed">
            <p>
              Lider du av <strong className="text-text-primary">sömnproblem</strong>,{' '}
              <strong className="text-text-primary">sömnlöshet</strong> eller{' '}
              <strong className="text-text-primary">insomni</strong>?
              Har du <strong className="text-text-primary">problem med att somna</strong> eller vaknar du
              mitt i natten med <strong className="text-text-primary">sömnsvårigheter</strong>?
              Insomnia.nu är öppet varje natt kl. 22:00–06:00 — precis när det är som svårast att sova.
              Du behöver aldrig vara ensam på natten.
            </p>
            <p className="text-center">
              Har du frågor? Hör av dig till{' '}
              <a href="mailto:info@insomnia.nu" className="text-accent-light hover:underline">
                info@insomnia.nu
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CPM-banner – botten */}
      <div className="relative z-10 mb-16 flex justify-center px-4 w-full">
        <AdBanner slot="homepage-bottom" size="leaderboard" />
      </div>

      {/* Fotnot */}
      <footer className="absolute bottom-2 text-text-muted text-xs text-center z-10 w-full">
        insomnia.nu &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Öppet 22:00–06:00
        &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-accent-light transition-colors">
          Integritetspolicy
        </Link>
      </footer>
    </div>
  )
}
