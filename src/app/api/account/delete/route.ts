import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * DELETE /api/account/delete
 * Raderar inloggad användares konto och all tillhörande data (GDPR artikel 17).
 * Kräver aktiv session.
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Ej inloggad.' }, { status: 401 })
    }

    const admin = createAdminClient()

    // 1. Radera Supabase Storage-bilder uppladdade av användaren
    const { data: images } = await admin
      .from('message_images')
      .select('storage_path')
      .eq('user_id', user.id)

    if (images && images.length > 0) {
      await admin.storage
        .from('chat-images')
        .remove(images.map((i: any) => i.storage_path))
    }

    // 2. Radera all användardata i databasen (cascadas via FK om satt,
    //    men vi gör det explicit för säkerhets skull)
    await admin.from('message_images').delete().eq('user_id', user.id)
    await admin.from('messages').delete().eq('user_id', user.id)
    await admin.from('reports').delete().or(`reporter_id.eq.${user.id},reported_id.eq.${user.id}`)
    await admin.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    await admin.from('chat_room_members').delete().eq('user_id', user.id)
    await admin.from('mood_log').delete().eq('user_id', user.id)
    await admin.from('users').delete().eq('id', user.id)

    // 3. Logga ut och radera auth-kontot
    await supabase.auth.signOut()
    await admin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Account delete error:', e)
    return NextResponse.json({ error: 'Kunde inte radera kontot.' }, { status: 500 })
  }
}
