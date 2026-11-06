import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { revalidateMarketPages } from '@/lib/market-cache'

export const dynamic = 'force-dynamic'

// Admin override to hide/unhide a partner's product (the partner can't undo a hide).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = z.object({ adminHidden: z.boolean() }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  const result = await prisma.product.updateMany({ where: { id, partnerId: { not: null } }, data: { adminHidden: parsed.data.adminHidden } })
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidateMarketPages()
  return NextResponse.json({ ok: true })
}
