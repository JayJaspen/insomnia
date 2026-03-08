import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isServiceOpen(): boolean {
  const now = new Date()
  const stockholm = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' })
  )
  const h = stockholm.getHours()
  return h >= 22 || h < 6
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── Admin-routes: kräver admin-roll, 24/7 ──────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?next=/admin', request.url))
    }
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.is_blocked) {
      return NextResponse.redirect(new URL('/?forbidden=1', request.url))
    }
    return supabaseResponse
  }

  // ── Cron-routes: skyddas av CRON_SECRET ─────────────────────
  if (pathname.startsWith('/api/cron')) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  // ── App-routes: kräver inloggning + öppettid ─────────────────
  // Routegruppen (app) skapar URL:erna /chat och /profile
  if (pathname.startsWith('/chat') || pathname.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?next=' + pathname, request.url))
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single()

    if (!profile || profile.is_blocked) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/?blocked=1', request.url))
    }

    if (!isServiceOpen()) {
      return NextResponse.redirect(new URL('/?closed=1', request.url))
    }

    return supabaseResponse
  }

  // ── Hemsidan: om inloggad + öppet → skicka till rätt vy ─────
  if (pathname === '/' && user) {
    if (isServiceOpen()) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  // ── Mood-väljaren: kräver inloggning ────────────────────────
  if (pathname === '/mood') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icons|avatars|manifest\\.json|sw\\.js|offline|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)',
  ],
}
