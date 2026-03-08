import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallBanner from '@/components/InstallBanner'

export const metadata: Metadata = {
  // ── Titlar ──────────────────────────────────────────────────────────────
  title: {
    default: 'Insomnia.nu – Kan du inte sova? Chatta med andra nattugglor',
    template: '%s | Insomnia.nu',
  },

  // ── Beskrivning (visas i Googles sökresultat) ──────────────────────────
  description:
    'Lider du av sömnproblem eller sömnlöshet? På Insomnia.nu kan du chatta anonymt med andra som också är vakna på natten. Öppet 22:00–06:00 varje natt. Du är inte ensam.',

  // ── Nyckelord ───────────────────────────────────────────────────────────
  keywords: [
    'kan inte sova',
    'problem med att somna',
    'sömnproblem',
    'sömnlöshet',
    'insomni',
    'sömnsvårigheter',
    'vaknar på natten',
    'chatta på natten',
    'nattugglor',
    'natt chatt',
    'chattrum natten',
    'sova inte',
    'hjälp att sova',
    'sömnstörningar',
    'sömnbrist',
    'insomnia chatt',
    'chatta anonymt',
    'ensam på natten',
    'sällskap natten',
    'chatt natt Sverige',
  ],

  // ── Kanonisk URL ────────────────────────────────────────────────────────
  metadataBase: new URL('https://www.insomnia.nu'),
  alternates: { canonical: '/' },

  // ── Open Graph (delning på sociala medier) ──────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.insomnia.nu',
    siteName: 'Insomnia.nu',
    title: 'Insomnia.nu – Kan du inte sova? Du är inte ensam',
    description:
      'Chatta med andra nattugglor som också kämpar med sömnproblem. Öppet varje natt 22:00–06:00. Gratis och anonymt.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Insomnia.nu – Nattens mötesplats',
      },
    ],
  },

  // ── Twitter / X ─────────────────────────────────────────────────────────
  twitter: {
    card: 'summary',
    title: 'Insomnia.nu – Kan du inte sova?',
    description: 'Chatta med andra som är vakna på natten. Öppet 22:00–06:00 varje natt.',
    images: ['/icons/icon-512.png'],
  },

  // ── Robots ─────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },

  // ── PWA ────────────────────────────────────────────────────────────────
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Insomnia' },
  icons: {
    icon: [
      { url: '/favicon.ico',       sizes: 'any' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F3460',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Insomnia.nu',
    url: 'https://www.insomnia.nu',
    description:
      'Chattjänst för personer med sömnproblem. Öppen 22:00–06:00 varje natt.',
    inLanguage: 'sv-SE',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.insomnia.nu',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="sv" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* JSON-LD strukturerad data för Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary min-h-screen">
        {children}
        <InstallBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
