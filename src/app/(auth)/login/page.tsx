'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isServiceOpen } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/mood'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Fel e-postadress eller lösenord.')
      setLoading(false)
      return
    }
    // Kolla roll och spärrstatus
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users').select('role, is_blocked').eq('id', user.id).single()
      if (profile?.is_blocked) {
        await supabase.auth.signOut()
        setError('Ditt konto har spärrats. Kontakta admin vid frågor.')
        setLoading(false)
        return
      }
      // Admin loggar alltid in, dygnet runt
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
        return
      }
      // Vanliga användare – kontrollera öppettider (22:00–06:00)
      if (!isServiceOpen()) {
        await supabase.auth.signOut()
        setError('Insomnia är stängt just nu. Välkommen tillbaka kl. 22:00! 🌙')
        setLoading(false)
        return
      }
    }
    window.location.href = '/mood'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold" style={{
            background: 'linear-gradient(135deg, #533483, #0F3460)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            insomnia
          </Link>
          <p className="text-text-muted text-sm mt-2">Logga in och sällskap väntar</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-text-muted text-sm mb-1 block">E-postadress</label>
            <input className="input" type="email" placeholder="din@email.se"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-text-muted text-sm mb-1 block">Lösenord</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Inget konto?{' '}
          <Link href="/register" className="text-accent-light hover:underline">
            Registrera dig
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Laddar...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
