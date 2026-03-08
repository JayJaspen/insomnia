import { createClient } from '@/lib/supabase/server'
import ProfileView from '@/components/ProfileView'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: friends } = await supabase
    .from('friendships')
    .select(`
      id, status, requester_id, addressee_id,
      requester:users!friendships_requester_id_fkey(id, display_name, avatar_id, city),
      addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_id, city)
    `)
    .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`)
    .eq('status', 'accepted')

  const { data: pending } = await supabase
    .from('friendships')
    .select(`
      id, requester_id,
      requester:users!friendships_requester_id_fkey(id, display_name, avatar_id)
    `)
    .eq('addressee_id', user!.id)
    .eq('status', 'pending')

  return (
    <ProfileView
      profile={profile}
      friends={friends ?? []}
      pendingRequests={pending ?? []}
      userId={user!.id}
    />
  )
}
