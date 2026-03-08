import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const MAX_LENGTH = 1000
const MSG_LIMIT  = 60

function sanitize(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ allowed: false, reason: 'Ej inloggad.' }, { status: 401 })
    }

    const rl = rateLimit(`msg:${user.id}`, MSG_LIMIT, 60_000)
    if (!rl.allowed) {
      const secs = Math.ceil(rl.retryAfterMs / 1000)
      return NextResponse.json(
        { allowed: false, reason: `Du skickar för snabbt. Vänta ${secs}s.` },
        { status: 429, headers: { 'Retry-After': String(secs) } },
      )
    }

    const body = await req.json()
    const content = sanitize(body?.content ?? '')
    if (!content) return NextResponse.json({ allowed: true })

    if (content.length > MAX_LENGTH) {
      return NextResponse.json({
        allowed: false,
        reason: `Meddelandet är för långt (max ${MAX_LENGTH} tecken).`,
      })
    }

    const { data: words } = await supabase.from('banned_words').select('word, category')
    const lower = content.toLowerCase()
    const match = (words ?? []).find((w: any) => lower.includes(w.word.toLowerCase()))

    if (match) {
      return NextResponse.json({
        allowed: false,
        reason: `Meddelandet innehåller otillåtet innehåll (kategori: ${match.category}).`,
      })
    }

    return NextResponse.json({ allowed: true, sanitized: content })
  } catch {
    return NextResponse.json({ allowed: true })
  }
}
