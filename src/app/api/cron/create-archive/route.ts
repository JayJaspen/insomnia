import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id, name, type, created_by, messages(id, user_id, content, has_image, created_at, message_images(id, user_id, storage_path))')

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, gender, city')

  const usersMap = Object.fromEntries((users ?? []).map(u => [u.id, u]))

  const manifest: Record<string, unknown> = {}
  ;(rooms ?? []).forEach(room => {
    const messages = (room as any).messages ?? []
    messages.forEach((msg: any) => {
      const userId = msg.user_id
      if (!manifest[userId]) {
        manifest[userId] = { user: usersMap[userId] ?? { id: userId }, messages: [], images: [] }
      }
      const entry = manifest[userId] as any
      entry.messages.push({ id: msg.id, room_id: room.id, room_name: (room as any).name ?? 'privat', content: msg.content, created_at: msg.created_at })
      ;(msg.message_images ?? []).forEach((img: any) => entry.images.push(img.storage_path))
    })
  })

  const archive = archiver('zip', { zlib: { level: 6 } })
  const passThrough = new PassThrough()
  const chunks: Buffer[] = []

  archive.pipe(passThrough)
  passThrough.on('data', (chunk: Buffer) => chunks.push(chunk))

  await new Promise<void>((resolve, reject) => {
    passThrough.on('end', resolve)
    passThrough.on('error', reject)
    archive.on('error', reject)

    ;(rooms ?? []).forEach(room => {
      archive.append(JSON.stringify(room, null, 2), { name: `chattar/${(room as any).type}_${room.id}.json` })
    })
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })
    archive.finalize()
  })

  const zipBuffer = Buffer.concat(chunks)
  const storagePath = `${today}/insomnia_${today}.zip`

  const { error: uploadError } = await supabase.storage
    .from('archives')
    .upload(storagePath, zipBuffer, { contentType: 'application/zip', upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  await supabase.from('daily_archives').upsert({ date: today, storage_path: storagePath, file_size: zipBuffer.length }, { onConflict: 'date' })

  return NextResponse.json({ success: true, date: today, size: zipBuffer.length, rooms: rooms?.length ?? 0 })
}