'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Archive, Users, Flag, LogOut } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link href={href} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      pathname === href ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
    }`}>
      {icon} {label}
    </Link>
  )

  return (
    <header className="bg-bg-secondary border-b border-accent/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <span className="text-accent-light font-bold text-lg mr-4">insomnia · admin</span>
        <nav className="flex gap-1 flex-1">
          {navLink('/admin/history', <Archive size={15}/>, 'Historik')}
          {navLink('/admin/users',   <Users size={15}/>, 'Användare')}
          {navLink('/admin/reports', <Flag size={15}/>, 'Anmälningar')}
        </nav>
        <button className="text-text-muted hover:text-danger transition-colors"
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}>
          <LogOut size={18}/>
        </button>
      </div>
    </header>
  )
}
