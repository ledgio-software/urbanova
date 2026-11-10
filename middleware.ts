import NextAuth from 'next-auth'
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'
import { authConfig } from './auth.config'
import { isMainHost, normalizeHost, partnerSitePath } from './lib/partner-hosts'

// Edge-safe auth (no providers) — only reads the session JWT.
const { auth } = NextAuth(authConfig)

// /admin, /partner and /rider are separate areas: each needs its own role, so e.g. a partner
// or rider session can never reach admin pages or APIs (and vice versa).
const inArea = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`)

const authMiddleware = auth((req) => {
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

// Partner websites (Reference I.7): any host that isn't URBANOVA's own is a partner's address.
// Handled before the auth wrapper, which re-bases requests onto the main site's URL.
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = req.nextUrl
  const host = normalizeHost(req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '')
  if (host && !isMainHost(host)) {
    const target = partnerSitePath(pathname)
    if (target && 'rewrite' in target) {
      const url = req.nextUrl.clone()
      url.pathname = `/site/${encodeURIComponent(host)}${target.rewrite}`
      return NextResponse.rewrite(url)
    }
    if (target && 'mainSite' in target) {
      // Dashboards, policies, tracking live on the main site (redirect issued by /site/<host>/to-main)
      const url = req.nextUrl.clone()
      url.pathname = `/site/${encodeURIComponent(host)}/to-main`
      const headers = new Headers(req.headers)
      headers.set('x-partner-site-path', pathname + search)
      return NextResponse.rewrite(url, { request: { headers } })
    }
    // APIs and static files fall through; API areas stay role-checked
  } else if (inArea(pathname, '/site')) {
    return new NextResponse('Not found', { status: 404 }) // partner sites are only reachable on their own address
  }
  // Auth.js types its wrapper as a route handler; as middleware it receives the fetch event
  return authMiddleware(req, event as unknown as Parameters<typeof authMiddleware>[1])
}

export const config = {
  // Every page request: partner websites are chosen by host name. Build assets and images are skipped.
  matcher: ['/((?!_next/static|_next/image).*)'],
}
