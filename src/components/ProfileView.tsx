'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTIES, CITIES_BY_COUNTY, AVATARS, AVATAR_LABELS } from '@/lib/constants'
import { Check, X, UserMinus } from 'lucide-react'

export default function ProfileView({ profile, friends, pendingRequests, userId }: any) {
  const router = useRouter()
  const supabase = createClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    displayName: profile?.display_name ?? '',
    county: profile?.county ?? '',
    city: profile?.city ?? '',
    avatarId: profile?.avatar_id ?? 'male_01',
  })
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const cities = CITIES_BY_COUNTY[form.county] ?? []

  async function saveProfile() {
    setSaving(true)
    setMsg('')
    const updates: any = {
      display_name: form.displayName,
      county: form.county,
      city: form.city,
      avatar_id: form.avatarId,
    }

    const { error } = await supabase.from('users').update(updates).eq('id', userId)
    if (error) {
      setMsg('Fel: ' + error.message)
    } else {
      if (newPassword.length >= 8) {
        await supabase.auth.updateUser({ password: newPassword })
      }
      setMsg('Profilen sparad!')
      setEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function respondToRequest(id: string, status: 'accepted' | 'rejected') {
    await supabase.from('friendships').update({ status }).eq('id', id)
    router.refresh()
  }

  async function removeFriend(id: string) {
    await supabase.from('friendships').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Profilkort */}
      <div className="glass p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={`/avatars/${form.avatarId}.svg`} alt=""
            className="w-20 h-20 rounded-full bg-bg-card border-2 border-accent-light" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{profile?.display_name}</h2>
            <p className="text-text-muted">{profile?.city}, {profile?.county}</p>
          </div>
          <button className="ml-auto btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? 'Avbryt' : 'Redigera'}
          </button>
        </div>

        {msg && (
          <div className="bg-success/10 border border-success/30 text-success rounded-xl p-3 mb-4 text-sm">
            {msg}
          </div>
        )}

        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-text-muted text-sm mb-1 block">Visningsnamn</label>
              <input className="input" value={form.displayName} maxLength={20}
                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Län</label>
              <select className="input" value={form.county}
                onChange={e => setForm(p => ({ ...p, county: e.target.value, city: '' }))}>
                {COUNTIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Stad</label>
              <select className="input" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                <option value="">Välj stad</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Nytt lösenord (lämna tomt = behåll)</label>
              <input className="input" type="password" placeholder="••••••••"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            {/* Avatar */}
            <div>
              <label className="text-text-muted text-sm mb-2 block">Avatar</label>
              {(['male', 'female', 'animal'] as const).map(cat => (
                <div key={cat} className="mb-3">
                  <p className="text-text-muted text-xs mb-1">{AVATAR_LABELS[cat]}</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS[cat].map(id => (
                      <button key={id}
                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                          form.avatarId === id ? 'border-accent-light scale-110' : 'border-transparent'
                        }`}
                        onClick={() => setForm(p => ({ ...p, avatarId: id }))}>
                        <img src={`/avatars/${id}.svg`} alt={id} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary w-full" onClick={saveProfile} disabled={saving}>
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </div>
        )}
      </div>

      {/* Väntande vänförfrågningar */}
      {pendingRequests.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-text-primary font-semibold mb-4">
            Väntande vänförfrågningar ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 bg-bg-card rounded-xl p-3">
                <img src={`/avatars/${req.requester?.avatar_id}.svg`} alt=""
                  className="w-9 h-9 rounded-full bg-bg-secondary border border-accent/30" />
                <span className="text-text-primary text-sm flex-1">
                  {req.requester?.display_name} vill bli din vän
                </span>
                <button className="text-success hover:text-success/80 transition-colors p-1"
                  onClick={() => respondToRequest(req.id, 'accepted')}>
                  <Check size={18} />
                </button>
                <button className="text-danger hover:text-danger/80 transition-colors p-1"
                  onClick={() => respondToRequest(req.id, 'rejected')}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vänner */}
      <div className="glass p-6">
        <h3 className="text-text-primary font-semibold mb-4">Mina vänner ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-text-muted text-sm">Du har inga vänner ännu. Klicka på en online-användare för att skicka förfrågan!</p>
        ) : (
          <div className="space-y-3">
            {friends.map((f: any) => {
              const friend = f.requester_id === userId ? f.addressee : f.requester
              return (
                <div key={f.id} className="flex items-center gap-3 bg-bg-card rounded-xl p-3">
                  <img src={`/avatars/${friend?.avatar_id}.svg`} alt=""
                    className="w-9 h-9 rounded-full bg-bg-secondary border border-accent/30" />
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-sm font-medium">{friend?.display_name}</div>
                    <div className="text-text-muted text-xs">{friend?.city}</div>
                  </div>
                  <button className="text-danger hover:text-danger/80 transition-colors p-1"
                    title="Avsluta vänskap"
                    onClick={() => removeFriend(f.id)}>
                    <UserMinus size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
