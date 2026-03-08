import { createClient } from '@/lib/supabase/server'
import ReportsView from '@/components/admin/ReportsView'

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey(id, display_name, avatar_id),
      reported:users!reports_reported_id_fkey(id, display_name, avatar_id)
    `)
    .order('created_at', { ascending: false })

  return <ReportsView reports={reports ?? []} />
}
