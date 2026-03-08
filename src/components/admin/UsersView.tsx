'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTIES } from '@/lib/constants'
import { calcAge } from '@/lib/utils'
import { Shield, ShieldOff, Users } from 'lucide-react'

export default function UsersView({ users }: { users: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [gender, setGender] = useState('')
  const [county, setCounty] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  const AGE_GROUPS = [
    { label: 'Alla åldrar', value: '' },
    { label: '18–25 år',    value: '18-25',  min: 18, max: 25  },
    { label: '26–35 år',    value: '26-35',  min: 26, max: 35  },
    { label: '36–45 år',    value: '36-45',  min: 36, max: 45  },
    { label: '46–55 år',    value: '46-55',  min: 46, max: 55  },
    { label: '56–65 år',    value: '56-65',  min: 56, max: 65  },
    { label: '65+ år',      value: '65+',    min: 66, max: 999 },
  ]

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
    router.refresh()
  }

  const GENDERS: Record<string, string> = { man: '♂ Man', kvinna: '♀ Kvinna', annat: '⚧ Annat' }

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
            {filtered.map((u, i) => (
              <tr key={u.id}
                className={`border-b border-accent/10 hover:bg-bg-hover transition-colors ${
                  u.is_blocked ? 'opacity-50' : ''
                }`}>
                <td className="px-4 py-3">
                  <img src={`/avatars/${u.avatar_id}.svg`} alt=""
                    className="w-8 h-8 rounded-full bg-bg-card border border-accent/20" />
                </td>
                <td className="px-4 py-3 text-text-primary font-medium">{u.display_name}</td>
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
    </div>
  )
}
