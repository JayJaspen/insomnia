import { createClient, createAdminClient } from '@/lib/supabase/server'
import UsersView from '@/components/admin/UsersView'

export default async function AdminUsersPage() {
  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  // Hämta profiler från users-tabellen
  const { data: profiles } = await supabase
    .from('users')
    .select('id, display_name, full_name, gender, county, city, birth_year, avatar_id, role, is_blocked, created_at, last_seen')
    .order('created_at', { ascending: false })

  // Hämta e-postadresser från Supabase Auth (kräver service-role)
  const { data: authData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of authData?.users ?? []) {
    if (u.email) emailMap[u.id] = u.email
  }

  // Slå ihop: lägg till email på varje profil
  const users = (profiles ?? []).map(p => ({
    ...p,
    email: emailMap[p.id] ?? null,
  }))

  return <UsersView users={users} />
}
