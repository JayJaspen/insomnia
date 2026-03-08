import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
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

    const supabase = createAdminClient()

    // Skapa auth-användare
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Ingen e-postverifiering krävs
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Kunde inte skapa konto.' }, { status: 400 })
    }

    // Skapa profil
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
      // Rensa auth-användaren om profilen misslyckades
      await supabase.auth.admin.deleteUser(authData.user.id)
      if (profileError.code === '23505') {
        return NextResponse.json({ error: 'Visningsnamnet är redan taget.' }, { status: 409 })
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Logga in användaren direkt
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      return NextResponse.json({ error: 'Konto skapat! Logga in manuellt.' }, { status: 201 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
