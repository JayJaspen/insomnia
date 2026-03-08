'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTIES } from '@/lib/constants'
import { calcAge } from '@/lib/utils'
import { Shield, ShieldOff, Users, X, User } from 'lucide-react'

export default function UsersView({ users }: { users: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [gender,   setGender]   = useState('')
  const [county,   setCounty]   = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [detail,   setDetail]   = useState<any | null>(null)

  const AGE_GROUPS = [
    { label: 'Alla åldrar', value: '' },
    { label: '18–25 år',    value: '18-25',  min: 18, max: 25  },
    { label: '26–35 år',    value: '26-35',  min: 26, max: 35  },
    { label: '36–45 år',    value: '36-45',  min: 36, max: 45  },
    { label: '46–55 år',    value: '46-55',  min: 46, max: 55  },
    { label: '56–65 år',    value: '56-65',  min: 56, max: 65  },
    { label: '65+ år',      value: '65+',    min: 66, max: 999 },
  ]

  const COUNTY_MAP = Object.fromEntries(COUNTIES.map(c => [c.id, c.name]))
  const GENDERS: Record<string, string> = { man: '♂ Man', kvinna: '♀ Kvinna', annat: '⚧ Annat' }

  const filtered = users.filter(u => {
    const age = calcAge(u.birth_year)
    if (gender && u.gender !== gender) return false
    if (county && u.county !== county) return false
    if (ageGroup) {
      const group = AGE_GROUPS.find(g => g.value === ageGroup)
      if (group && group.min !== undefined) {
        if (age < group.min || age > group.max) return false
      }
    }
    return true
  })

  async function toggleBlock(u: any) {
    const newState = !u.is_blocked
    await supabase.from('users').update({ is_blocked: newState }).eq('id', u.id)
    // Uppdatera lokalt om detaljmodalen är öppen
    if (detail?.id === u.id) setDetail({ ...detail, is_blocked: newState })
    router.refresh()
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2 border-b border-accent/10 last:border-0">
      <span className="text-text-muted text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-text-primary text-sm">{value ?? '–'}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-accent-light" size={24} />
        <h1 className="text-2xl font-bold text-text-primary">
          Användare ({filtered.length} / {users.length})
        </h1>
      </div>

      {/* Filter */}
      <div className="glass p-4 flex flex-wrap gap-3">
        <select className="input w-auto py-2"
          value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Alla kön</option>
          <option value="man">Man</option>
          <option value="kvinna">Kvinna</option>
          <option value="annat">Annat</option>
        </select>
        <select className="input w-auto py-2"
          value={county} onChange={e => setCounty(e.target.value)}>
          <option value="">Alla län</option>
          {COUNTIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input w-auto py-2"
          value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
          {AGE_GROUPS.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <button className="btn-secondary py-2 px-4"
          onClick={() => { setGender(''); setCounty(''); setAgeGroup('') }}>
          Rensa filter
        </button>
      </div>

      {/* Tabell */}
      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-accent/20">
              {['Avatar','Visningsnamn','Kön','Ålder','Stad','Registrerad','Status','Åtgärd']
                .map(h => (
                <th key={h} className="text-left px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}
                className={`border-b border-accent/10 hover:bg-bg-hover transition-colors ${
                  u.is_blocked ? 'opacity-50' : ''
                }`}>
                <td className="px-4 py-3">
                  <img src={`/avatars/${u.avatar_id}.svg`} alt=""
                    className="w-8 h-8 rounded-full bg-bg-card border border-accent/20" />
                </td>
                {/* Klickbart namn */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDetail(u)}
                    className="text-accent-light hover:text-white font-medium hover:underline transition-colors text-left"
                  >
                    {u.display_name}
                  </button>
                </td>
                <td className="px-4 py-3 text-text-muted">{GENDERS[u.gender]}</td>
                <td className="px-4 py-3 text-text-muted">{calcAge(u.birth_year)}</td>
                <td className="px-4 py-3 text-text-muted">{u.city}</td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {new Date(u.created_at).toLocaleDateString('sv-SE')}
                </td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <span className="text-accent-light text-xs font-medium">Admin</span>
                  ) : u.is_blocked ? (
                    <span className="text-danger text-xs font-medium">Spärrad</span>
                  ) : (
                    <span className="text-success text-xs font-medium">Aktiv</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleBlock(u)}
                      className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg border transition-all ${
                        u.is_blocked
                          ? 'border-success/30 text-success hover:bg-success/10'
                          : 'border-danger/30 text-danger hover:bg-danger/10'
                      }`}>
                      {u.is_blocked
                        ? <><ShieldOff size={12}/> Häv spärr</>
                        : <><Shield size={12}/> Spärra</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-8 text-sm">Inga användare matchar filtret.</p>
        )}
      </div>

      {/* ── Detaljmodal ── */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="glass border border-accent/30 rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal-header */}
            <div className="flex items-center gap-4 p-6 border-b border-accent/20">
              <img
                src={`/avatars/${detail.avatar_id}.svg`}
                alt=""
                className="w-16 h-16 rounded-full bg-bg-card border-2 border-accent-light flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-text-primary font-bold text-lg truncate">{detail.display_name}</h2>
                {detail.full_name && (
                  <p className="text-text-muted text-sm truncate">{detail.full_name}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {detail.role === 'admin' ? (
                    <span className="text-xs bg-accent-light/20 text-accent-light px-2 py-0.5 rounded-full">Admin</span>
                  ) : detail.is_blocked ? (
                    <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">Spärrad</span>
                  ) : (
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Aktiv</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-text-muted hover:text-text-primary p-1 flex-shrink-0"
                aria-label="Stäng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Detaljrader */}
            <div className="p-6 space-y-0">
              <Row label="Kön"           value={GENDERS[detail.gender]} />
              <Row label="Ålder"         value={`${calcAge(detail.birth_year)} år (födelseår ${detail.birth_year})`} />
              <Row label="Stad"          value={detail.city} />
              <Row label="Län"           value={COUNTY_MAP[detail.county] ?? detail.county} />
              <Row label="Registrerad"   value={new Date(detail.created_at).toLocaleDateString('sv-SE', {
                year: 'numeric', month: 'long', day: 'numeric'
              })} />
              <Row label="Senast sedd"   value={detail.last_seen
                ? new Date(detail.last_seen).toLocaleString('sv-SE', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                  })
                : 'Aldrig'
              } />
              <Row label="Användar-ID"   value={
                <span className="font-mono text-xs break-all text-text-muted">{detail.id}</span>
              } />
            </div>

            {/* Åtgärder */}
            {detail.role !== 'admin' && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => toggleBlock(detail)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    detail.is_blocked
                      ? 'border-success/40 text-success hover:bg-success/10'
                      : 'border-danger/40 text-danger hover:bg-danger/10'
                  }`}
                >
                  {detail.is_blocked
                    ? <><ShieldOff size={16}/> Häv spärr</>
                    : <><Shield size={16}/> Spärra användare</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
