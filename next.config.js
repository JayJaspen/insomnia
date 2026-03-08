/** @type {import('next').NextConfig} */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co'

// Content-Security-Policy
const CSP = [
  "default-src 'self'",
  // Skript: egna + Next.js inline (nonce-baserat är bättre men kräver edge middleware)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Stilar
  "style-src 'self' 'unsafe-inline'",
  // Bilder: egna + supabase storage + data-URI:er
  `img-src 'self' data: blob: https://${supabaseHost}`,
  // WebSocket (Supabase Realtime) + HTTPS fetch
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
  // Fonter
  "font-src 'self'",
  // Formulär
  "form-action 'self'",
  // Ingen inbäddning i iframe (clickjacking-skydd)
  "frame-ancestors 'none'",
  // Inga plugins
  "object-src 'none'",
  // Bas-URI
  "base-uri 'self'",
].join('; ')

const securityHeaders = [
  // Förhindrar MIME-sniffing
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Skyddar mot clickjacking
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Styr referrer-info
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Begränsar åtkomst till webbläsarfunktioner
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // HSTS – tvinga HTTPS (1 år)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // XSS-filter (äldre webbläsare)
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  // Content Security Policy
  { key: 'Content-Security-Policy',   value: CSP },
]

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  async headers() {
    return [
      // Säkerhetsheaders på alla routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Service worker – ingen cache
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      // PWA manifest
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
