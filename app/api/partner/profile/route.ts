import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPartnerContext } from '@/lib/authz'
import { PartnerProfileSchema } from '@/lib/partners'

export const dynamic = 'force-dynamic'

// A partner can only ever read/update their own partner record — the id comes from the session, never the request.
export async function PUT(req: NextRequest) {
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PartnerProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  // Customers pay a live stockist directly, so their Mobile Money details can't be removed
  const d = parsed.data
  if (ctx.partner.type === 'stockist' && ctx.partner.status === 'active' && !(d.payoutMethod && d.payoutAccountName && d.payoutAccountNumber)) {
    return NextResponse.json({ error: 'Customers pay you directly — keep your payment method, account name and number filled in.' }, { status: 422 })
  }

  await prisma.partner.update({ where: { id: ctx.partner.id }, data: parsed.data })
  return NextResponse.json({ ok: true })
}
