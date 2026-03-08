'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COUNTIES, CITIES_BY_COUNTY, GENDERS, AVATARS, AVATAR_LABELS } from '@/lib/constants'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1930 - 17 }, (_, i) => CURRENT_YEAR - 18 - i)

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=info, 2=location, 3=avatar
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    displayName: '',
    gender: '',
    county: '',
    city: '',
    birthYear: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarId: 'male_01',
  })

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const cities = form.county ? (CITIES_BY_COUNTY[form.county] ?? []) : []

  async function handleSubmit() {
    setError('')
    if (form.password !== form.confirmPassword) {
      return setError('Lösenorden matchar inte.')
    }
    if (form.password.length < 8) {
      return setError('Lösenordet måste vara minst 8 tecken.')
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          displayName: form.displayName,
          gender: form.gender,
          county: form.county,
          city: form.city,
          birthYear: parseInt(form.birthYear),
          email: form.email,
          password: form.password,
          avatarId: form.avatarId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registrering misslyckades.')
      // Logga in client-side så cookies sätts korrekt i webbläsaren
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      window.location.href = '/mood'
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "input"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Skapa konto</h1>
          <p className="text-text-muted text-sm mt-1">Steg {step} av 3</p>
          {/* Progress */}
          <div className="flex gap-2 justify-center mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-accent-light' : 'bg-bg-card'
              }`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* STEG 1: Personlig info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-text-muted text-sm mb-1 block">Riktigt namn (visas ej för andra)</label>
              <input className={inputClass} placeholder="Förnamn Efternamn"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Visningsnamn (synligt för alla)</label>
              <input className={inputClass} placeholder="t.ex. Nattuggle91" maxLength={20}
                value={form.displayName} onChange={e => set('displayName', e.target.value)} />
              <p className="text-text-muted text-xs mt-1">{form.displayName.length}/20 tecken, minst 3</p>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Kön (synligt för alla)</label>
              <select className={inputClass} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Välj kön</option>
                {GENDERS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Födelseår (ålder visas för andra)</label>
              <select className={inputClass} value={form.birthYear} onChange={e => set('birthYear', e.target.value)}>
                <option value="">Välj år</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">E-postadress (privat)</label>
              <input className={inputClass} type="email" placeholder="din@email.se"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Lösenord (minst 8 tecken)</label>
              <input className={inputClass} type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Bekräfta lösenord</label>
              <input className={inputClass} type="password" placeholder="••••••••"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-danger text-xs mt-1">Lösenorden matchar inte.</p>
              )}
            </div>
            <button className="btn-primary w-full mt-2"
              disabled={!form.fullName || !form.displayName || form.displayName.length < 3
                        || !form.gender || !form.birthYear || !form.email
                        || form.password.length < 8 || !form.confirmPassword
                        || form.password !== form.confirmPassword}
              onClick={() => setStep(2)}>
              Nästa →
            </button>
          </div>
        )}

        {/* STEG 2: Plats */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-text-muted text-sm mb-1 block">Län (synligt för alla)</label>
              <select className={inputClass} value={form.county}
                onChange={e => { set('county', e.target.value); set('city', '') }}>
                <option value="">Välj län</option>
                {COUNTIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Stad (synligt för alla)</label>
              <select className={inputClass} value={form.city} onChange={e => set('city', e.target.value)}
                disabled={!form.county}>
                <option value="">Välj stad</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Tillbaka</button>
              <button className="btn-primary flex-1" onClick={() => setStep(3)}
                disabled={!form.county || !form.city}>
                Nästa →
              </button>
            </div>
          </div>
        )}

        {/* STEG 3: Avatar */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-text-muted text-sm">Välj din avatar – den visas för alla användare.</p>
            {(['male', 'female', 'animal'] as const).map(cat => (
              <div key={cat}>
                <h3 className="text-text-secondary text-sm font-medium mb-2">{AVATAR_LABELS[cat]}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS[cat].map(id => (
                    <button key={id}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${
                        form.avatarId === id
                          ? 'border-accent-light scale-110 shadow-lg shadow-accent-light/30'
                          : 'border-transparent hover:border-accent/50'
                      }`}
                      onClick={() => set('avatarId', id)}
                    >
                      <img
                        src={`/avatars/${id}.svg`}
                        alt={id}
                        className="w-full aspect-square object-cover bg-bg-card"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Tillbaka</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Skapar konto...' : 'Skapa konto!'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-text-muted text-sm mt-6">
          Har du redan ett konto?{' '}
          <Link href="/login" className="text-accent-light hover:underline">Logga in</Link>
        </p>
      </div>
    </div>
  )
}
