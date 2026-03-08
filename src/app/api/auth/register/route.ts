import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 registreringar per IP per timme
    const ip = getClientIp(req)
    const rl = rateLimit(`reg:${ip}`, 5, 60 * 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'För många försök. Prova igen om en timme.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const { fullName, displayName, gender, county, city, birthYear, email, password, avatarId } = body

    // Validering
    if (!fullName || !displayName || !gender || !county || !city || !birthYear || !email || !password) {
      return NextResponse.json({ error: 'Alla fält krävs.' }, { status: 400 })
    }
    if (displayName.length < 3 || displayName.length > 20) {
      return NextResponse.json({ error: 'Visningsnamnet måste vara 3–20 tecken.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken.' }, { status: 400 })
    }
    // Ålderskontroll – måste ha fyllt 18
    const currentYear = new Date().getFullYear()
    if (!birthYear || currentYear - birthYear < 18 || currentYear - birthYear > 110) {
      return NextResponse.json({ error: 'Du måste vara minst 18 år.' }, { status: 400 })
    }
    // E-post format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ogiltig e-postadress.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Kunde inte skapa konto.' }, { status: 400 })
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      full_name: fullName,
      display_name: displayName,
      gender,
      county,
      city,
      birth_year: birthYear,
      avatar_id: avatarId ?? 'male_01',
      role: 'user',
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      if (profileError.code === '23505') {
        return NextResponse.json({ error: 'Visningsnamnet är redan taget.' }, { status: 409 })
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
