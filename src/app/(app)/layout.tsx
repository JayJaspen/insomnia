import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/AppNav'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, avatar_id, role, mood_log(mood)')
    .eq('id', user.id)
    .order('created_at', { referencedTable: 'mood_log', ascending: false })
    .limit(1, { referencedTable: 'mood_log' })
    .single()

  // Admin ska aldrig se användar-layouten
  if (profile?.role === 'admin') redirect('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav profile={profile} userId={user.id} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
