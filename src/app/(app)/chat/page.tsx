import { createClient } from '@/lib/supabase/server'
import ChatView from '@/components/ChatView'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('*, chat_room_members!inner(user_id)')
    .or(`type.eq.group,chat_room_members.user_id.eq.${user!.id}`)
    .order('created_at', { ascending: false })

  return <ChatView currentUser={profile} initialRooms={rooms ?? []} />
}
