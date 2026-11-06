import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// Per-request role checks for route handlers and server components.
// Middleware already gates /admin, /partner and their APIs; these re-check (defence in depth)
// and, for partners, confirm against the database that the account and partner still exist
// and aren't suspended — a JWT can outlive a suspension.

export async function requireAdmin() {
  const session = await auth()
  return session?.user?.role === 'admin' ? session : null
}

export async function getPartnerContext() {
  const session = await auth()
  const { role, id, partnerId } = session?.user ?? {}
  if (role !== 'partner' || !id || !partnerId) return null

  const user = await prisma.partnerUser.findUnique({ where: { id }, include: { partner: true } })
  if (!user || user.partnerId !== partnerId || user.partner.status === 'suspended') return null
  return { user, partner: user.partner }
}

export type PartnerContext = NonNullable<Awaited<ReturnType<typeof getPartnerContext>>>

export async function getRiderContext() {
  const session = await auth()
  const { role, id } = session?.user ?? {}
  if (role !== 'rider' || !id) return null

  const rider = await prisma.rider.findUnique({ where: { id } })
  if (!rider || rider.status !== 'active') return null
  return { rider }
}
