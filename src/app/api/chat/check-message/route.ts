import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()
    if (!content) return NextResponse.json({ allowed: true })

    const supabase = createClient()
    const { data: words } = await supabase.from('banned_words').select('word, category')

    const lower = content.toLowerCase()
    const match = (words ?? []).find(w => lower.includes(w.word.toLowerCase()))

    if (match) {
      return NextResponse.json({
        allowed: false,
        reason: `Meddelandet innehåller otillåtet innehåll (kategori: ${match.category}).`,
      })
    }

    return NextResponse.json({ allowed: true })
  } catch {
    return NextResponse.json({ allowed: true })
  }
}
