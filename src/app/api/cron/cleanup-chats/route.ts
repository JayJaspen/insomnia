import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 1. Hämta alla bildvägar innan vi raderar
  const { data: images } = await supabase
    .from('message_images')
    .select('storage_path')

  const paths = (images ?? []).map(i => i.storage_path)

  // 2. Radera bilder från Storage
  if (paths.length > 0) {
    await supabase.storage.from('chat-images').remove(paths)
  }

  // 3. Radera message_images (FK cascade tar resten)
  await supabase.from('message_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 4. Radera messages
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 5. Radera chat_room_members
  await supabase.from('chat_room_members').delete().neq('room_id', '00000000-0000-0000-0000-000000000000')

  // 6. Radera chat_rooms
  await supabase.from('chat_rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 7. Radera mood_log
  await supabase.from('mood_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({
    success: true,
    deleted: {
      images: paths.length,
      timestamp: new Date().toISOString(),
    },
  })
}
