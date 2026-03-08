'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MessageSquare, User, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: { display_name: string; avatar_id: string; role?: string; mood_log?: { mood: string }[] } | null
  userId: string
}

export default function AppNav({ profile, userId }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const mood = profile?.mood_log?.[0]?.mood

  const MOODS: Record<string, string> = {
    sleepy: '😴', happy: '😊', melancholic: '🌙', thoughtful: '🤔',
    restless: '⚡', anxious: '😰', listening: '🎧', loving: '💜',
    funny: '😂', stressed: '😤',
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        pathname === href
          ? 'bg-accent text-white'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </Link>
  )

  return (
    <header className="bg-bg-secondary border-b border-accent/20 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-accent-light whitespace-nowrap">
          insomnia
        </Link>

        {/* Nav tabs */}
        <nav className="flex gap-1">
          {navItem('/chat', <MessageSquare size={16} />, 'Chat')}
          {navItem('/profile', <User size={16} />, 'Min sida')}
          {profile?.role === 'admin' && navItem('/admin', <Settings size={16} />, 'Admin')}
        </nav>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-text-muted">
            {mood && <span title="Ditt humör">{MOODS[mood] ?? '🌙'}</span>}
            <span className="text-text-primary font-medium">{profile?.display_name}</span>
          </div>
          <img
            src={`/avatars/${profile?.avatar_id ?? 'male_01'}.svg`}
            alt="Avatar"
            className="w-8 h-8 rounded-full bg-bg-card border border-accent/30"
          />
          <button
            onClick={signOut}
            className="text-text-muted hover:text-danger transition-colors p-1"
            title="Logga ut"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
