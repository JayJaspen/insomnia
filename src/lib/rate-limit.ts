/**
 * Enkel in-memory rate limiter.
 * Fungerar per Vercel-instans – tillräckligt för låg-till-medel trafik.
 * Vid hög trafik: byt ut mot Upstash Redis + @upstash/ratelimit.
 */

interface Entry { count: number; reset: number }
const store = new Map<string, Entry>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.reset - now }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 }
}

/** Hämtar klientens IP-adress (Vercel/proxy-medveten) */
export function getClientIp(req: Request): string {
  const headers = (req as any).headers
  return (
    headers.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get?.('x-real-ip') ??
    'unknown'
  )
}
