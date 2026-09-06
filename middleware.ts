import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth')

  if (isApiAuth) return NextResponse.next()
  if (isAdminRoute && !isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Protect all /api/admin/* routes
  if (req.nextUrl.pathname.startsWith('/api/admin') && !req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
