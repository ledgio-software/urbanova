import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'

// Edge-safe auth (no providers) — only reads the session JWT.
const { auth } = NextAuth(authConfig)

// /admin, /partner and /rider are separate areas: each needs its own role, so e.g. a partner
// or rider session can never reach admin pages or APIs (and vice versa).
const inArea = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (inArea(pathname, '/api/admin')) {
    if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }
  if (inArea(pathname, '/api/partner')) {
    if (role !== 'partner') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }
  if (inArea(pathname, '/api/rider')) {
    if (role !== 'rider') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  for (const [base, requiredRole] of [['/admin', 'admin'], ['/partner', 'partner'], ['/rider', 'rider']] as const) {
    if (!inArea(pathname, base)) continue
    const loginPath = `${base}/login`
    if (pathname === loginPath) {
      return role === requiredRole ? NextResponse.redirect(new URL(base, req.url)) : NextResponse.next()
    }
    if (role !== requiredRole) return NextResponse.redirect(new URL(loginPath, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/partner/:path*', '/api/partner/:path*', '/rider/:path*', '/api/rider/:path*'],
}
