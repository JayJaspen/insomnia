import { createClient } from '@/lib/supabase/server'
import UsersView from '@/components/admin/UsersView'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, full_name, gender, county, city, birth_year, avatar_id, role, is_blocked, created_at, last_seen')
    .order('created_at', { ascending: false })

  return <UsersView users={users ?? []} />
}
