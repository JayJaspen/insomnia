import { createClient } from '@/lib/supabase/server'
import HistoryView from '@/components/admin/HistoryView'

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: archives } = await supabase
    .from('daily_archives')
    .select('*')
    .order('date', { ascending: false })

  return <HistoryView archives={archives ?? []} />
}
