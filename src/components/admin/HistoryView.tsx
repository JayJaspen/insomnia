'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Download, Trash2, Archive } from 'lucide-react'

interface Archive { id: string; date: string; storage_path: string; file_size: number | null }

export default function HistoryView({ archives }: { archives: Archive[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const selectedArchive = archives.find(a => a.date === selected)

  async function downloadArchive(archive: Archive) {
    const { data, error } = await supabase.storage
      .from('archives')
      .createSignedUrl(archive.storage_path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  async function deleteArchive(archive: Archive) {
    if (!confirm(`Radera arkivet från ${archive.date}?`)) return
    setLoading(true)
    await supabase.storage.from('archives').remove([archive.storage_path])
    await supabase.from('daily_archives').delete().eq('id', archive.id)
    setSelected('')
    router.refresh()
    setLoading(false)
  }

  const fmtSize = (bytes: number | null) => {
    if (!bytes) return '–'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Archive className="text-accent-light" size={24} />
        <h1 className="text-2xl font-bold text-text-primary">Historik</h1>
      </div>

      {archives.length === 0 ? (
        <div className="glass p-8 text-center text-text-muted">
          Inga arkiv ännu. Arkiv skapas automatiskt kl. 06:00.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Datumväljare */}
          <div className="glass p-4">
            <h2 className="text-text-muted text-sm uppercase tracking-widest mb-3">Välj datum</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {archives.map(a => (
                <button key={a.id}
                  onClick={() => setSelected(a.date)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selected === a.date
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:bg-bg-hover hover:text-text-primary'
                  }`}>
                  {a.date}
                  <span className="float-right text-xs opacity-60">{fmtSize(a.file_size)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detaljer */}
          <div className="md:col-span-2">
            {selectedArchive ? (
              <div className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-text-primary font-semibold text-lg">
                    Arkiv: {selectedArchive.date}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={() => downloadArchive(selectedArchive)}>
                      <Download size={16} /> Ladda ner ZIP
                    </button>
                    <button
                      className="btn-danger flex items-center gap-2"
                      onClick={() => deleteArchive(selectedArchive)}
                      disabled={loading}>
                      <Trash2 size={16} /> Radera
                    </button>
                  </div>
                </div>
                <div className="bg-bg-card rounded-xl p-4 text-sm text-text-muted">
                  <p>Filstorlek: <span className="text-text-primary">{fmtSize(selectedArchive.file_size)}</span></p>
                  <p className="mt-1">Sökväg: <span className="text-text-primary font-mono text-xs">{selectedArchive.storage_path}</span></p>
                  <p className="mt-3 text-xs">
                    ZIP-filen innehåller alla chattar och bilder från detta datum,
                    organiserade per användare (se manifest.json i ZIP-filen).
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass p-8 text-center text-text-muted">
                Välj ett datum till vänster för att se detaljer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
