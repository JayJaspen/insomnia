import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: images } = await supabase
    .from('message_images')
    .select('storage_path')

  const paths = (images ?? []).map((i: { storage_path: string }) => i.storage_path)

  if (paths.length > 0) {
    await supabase.storage.from('chat-images').remove(paths)
  }

  const DUMMY = '00000000-0000-0000-0000-000000000000'
  await supabase.from('message_images').delete().neq('id', DUMMY)
  await supabase.from('messages').delete().neq('id', DUMMY)
  await supabase.from('chat_room_members').delete().neq('room_id', DUMMY)
  await supabase.from('chat_rooms').delete().neq('id', DUMMY)
  await supabase.from('mood_log').delete().neq('id', DUMMY)

  return NextResponse.json({ success: true, deleted: { images: paths.length, timestamp: new Date().toISOString() } })
}