'use client'
import { useEffect, useState } from 'react'
import { MOODS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

export default function MoodPage() {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  // Admin ska aldrig hamna här — skicka direkt till /admin
  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      }
    }
    checkRole()
  }, [])

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('mood_log').insert({
        user_id: user.id,
        mood: selected,
        session_date: new Date().toISOString().split('T')[0],
      })
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/chat'
      }
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl">🌙</span>
          <h1 className="text-2xl font-bold text-text-primary mt-3">Hur mår du just nu?</h1>
          <p className="text-text-muted text-sm mt-1">Ditt humör visas bredvid ditt namn i chatten</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {MOODS.map(mood => (
            <button
              key={mood.id}
              onClick={() => setSelected(mood.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                selected === mood.id
                  ? 'border-accent-light bg-accent-light/10 shadow-lg shadow-accent-light/20'
                  : 'border-accent/20 bg-bg-card hover:border-accent/50'
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <div>
                <div className="text-text-primary font-medium text-sm">{mood.label}</div>
                <div className="text-text-muted text-xs">{mood.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          className="btn-primary w-full"
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? 'Startar...' : 'Välkommen in →'}
        </button>
      </div>
    </div>
  )
}
