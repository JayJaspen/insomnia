import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function GET(req: NextRequest) {
  // Vercel Cron skickar Authorization: Bearer <secret>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Hämta alla chattar med meddelanden och bilder
  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select(`
      id, name, type, created_by,
      messages(
        id, user_id, content, has_image, created_at,
        message_images(id, user_id, storage_path)
      )
    `)

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, gender, city')

  const usersMap = Object.fromEntries((users ?? []).map(u => [u.id, u]))

  // Bygg manifest: vem äger vad
  const manifest: Record<string, any> = {}
  ;(rooms ?? []).forEach(room => {
    const messages = (room as any).messages ?? []
    messages.forEach((msg: any) => {
      const userId = msg.user_id
      if (!manifest[userId]) {
        manifest[userId] = {
          user: usersMap[userId] ?? { id: userId },
          messages: [],
          images: [],
        }
      }
      manifest[userId].messages.push({
        id: msg.id,
        room_id: room.id,
        room_name: room.name ?? 'privat',
        content: msg.content,
        created_at: msg.created_at,
      })
      ;(msg.message_images ?? []).forEach((img: any) => {
        manifest[userId].images.push(img.storage_path)
      })
    })
  })

  // Skapa ZIP i minnet
  const chunks: Buffer[] = []
  const archive = archiver('zip', { zlib: { level: 6 } })

  await new Promise<void>((resolve, reject) => {
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    archive.on('end', resolve)
    archive.on('error', reject)

    // Lägg till chattar
    ;(rooms ?? []).forEach(room => {
      archive.append(JSON.stringify(room, null, 2), {
        name: `chattar/${room.type}_${room.id}.json`,
      })
    })

    // Lägg till manifest
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

    archive.finalize()
  })

  const zipBuffer = Buffer.concat(chunks)
  const storagePath = `${today}/insomnia_${today}.zip`

  // Ladda upp till Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('archives')
    .upload(storagePath, zipBuffer, {
      contentType: 'application/zip',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Spara metadata
  await supabase.from('daily_archives').upsert({
    date: today,
    storage_path: storagePath,
    file_size: zipBuffer.length,
  }, { onConflict: 'date' })

  return NextResponse.json({
    success: true,
    date: today,
    size: zipBuffer.length,
    rooms: rooms?.length ?? 0,
  })
}
