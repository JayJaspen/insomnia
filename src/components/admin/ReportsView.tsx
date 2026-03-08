'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flag, Trash2, Bookmark, Shield } from 'lucide-react'

export default function ReportsView({ reports }: { reports: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [filter, setFilter] = useState<'all' | 'new' | 'saved'>('all')

  const filtered = reports.filter(r => filter === 'all' ? true : r.status === filter)

  async function updateStatus(id: string, status: string) {
    await supabase.from('reports').update({ status }).eq('id', id)
    router.refresh()
  }

  async function deleteReport(id: string) {
    await supabase.from('reports').delete().eq('id', id)
    router.refresh()
  }

  async function blockReported(userId: string) {
    await supabase.from('users').update({ is_blocked: true }).eq('id', userId)
    router.refresh()
  }

  const statusBadge = (s: string) => ({
    new:   'bg-warning/10 text-warning border-warning/30',
    read:  'bg-accent/10 text-text-muted border-accent/30',
    saved: 'bg-success/10 text-success border-success/30',
  }[s] ?? '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="text-accent-light" size={24} />
          <h1 className="text-2xl font-bold text-text-primary">
            Anmälningar ({filtered.length})
          </h1>
        </div>
        <div className="flex gap-2">
          {(['all','new','saved'] as const).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                filter === f ? 'bg-accent border-accent text-white' : 'border-accent/30 text-text-muted'
              }`}>
              {f === 'all' ? 'Alla' : f === 'new' ? 'Nya' : 'Sparade'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(r => (
          <div key={r.id} className="glass p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>
                    {r.status === 'new' ? 'Ny' : r.status === 'read' ? 'Läst' : 'Sparad'}
                  </span>
                  <span className="text-text-muted text-xs">
                    {new Date(r.created_at).toLocaleString('sv-SE')}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-bg-card rounded-lg p-3">
                    <p className="text-text-muted text-xs mb-1">Anmälare</p>
                    <div className="flex items-center gap-2">
                      <img src={`/avatars/${r.reporter?.avatar_id ?? 'male_01'}.svg`} alt=""
                        className="w-7 h-7 rounded-full bg-bg-secondary" />
                      <span className="text-text-primary text-sm">{r.reporter?.display_name ?? '(borttagen)'}</span>
                    </div>
                  </div>
                  <div className="bg-bg-card rounded-lg p-3">
                    <p className="text-text-muted text-xs mb-1">Anmäld person</p>
                    <div className="flex items-center gap-2">
                      <img src={`/avatars/${r.reported?.avatar_id ?? 'male_01'}.svg`} alt=""
                        className="w-7 h-7 rounded-full bg-bg-secondary" />
                      <span className="text-text-primary text-sm">{r.reported?.display_name ?? '(borttagen)'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-card rounded-lg p-3">
                  <p className="text-text-muted text-xs mb-1">Anledning</p>
                  <p className="text-text-primary text-sm leading-relaxed">{r.reason}</p>
                </div>
              </div>

              {/* Åtgärder */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {r.status === 'new' && (
                  <button className="btn-secondary text-xs py-1.5 px-3"
                    onClick={() => updateStatus(r.id, 'read')}>
                    Markera läst
                  </button>
                )}
                <button className="flex items-center gap-1 text-success border border-success/30
                                   hover:bg-success/10 px-3 py-1.5 rounded-lg text-xs transition-all"
                  onClick={() => updateStatus(r.id, 'saved')}>
                  <Bookmark size={12}/> Spara
                </button>
                {r.reported && (
                  <button className="flex items-center gap-1 text-danger border border-danger/30
                                     hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs transition-all"
                    onClick={() => blockReported(r.reported.id)}>
                    <Shield size={12}/> Spärra
                  </button>
                )}
                <button className="flex items-center gap-1 text-text-muted border border-text-muted/30
                                   hover:bg-danger/10 hover:text-danger hover:border-danger/30
                                   px-3 py-1.5 rounded-lg text-xs transition-all"
                  onClick={() => deleteReport(r.id)}>
                  <Trash2 size={12}/> Radera
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass p-8 text-center text-text-muted">
            Inga anmälningar {filter !== 'all' ? `med status "${filter}"` : ''}.
          </div>
        )}
      </div>
    </div>
  )
}
