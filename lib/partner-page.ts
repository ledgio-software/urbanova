import { redirect } from 'next/navigation'
import { getPartnerContext } from '@/lib/authz'

// For partner dashboard pages (server components).
// A missing/suspended account signs the session out instead of redirecting to /partner/login,
// which middleware would bounce straight back here while the old JWT is still valid.
export async function requirePartnerPage({ allowPasswordChange = false } = {}) {
  const ctx = await getPartnerContext()
  if (!ctx) redirect('/partner/signout')
  if (ctx.user.mustChangePassword && !allowPasswordChange) redirect('/partner/password')
  return ctx
}
