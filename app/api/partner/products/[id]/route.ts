import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPartnerContext } from '@/lib/authz'
import { PartnerProductSchema } from '@/lib/market-products'
import { deletePartnerProduct, ProductRuleError, updatePartnerProduct } from '@/lib/partner-products-db'
import { revalidateMarketPages } from '@/lib/market-cache'

export const dynamic = 'force-dynamic'

// Every handler re-checks that the product belongs to the signed-in partner; others get 404.
async function ownProduct(id: string) {
  const ctx = await getPartnerContext()
  if (!ctx) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (ctx.user.mustChangePassword) return { error: NextResponse.json({ error: 'Set your password first' }, { status: 403 }) }
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, partnerId: true } })
  if (!product || product.partnerId !== ctx.partner.id) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  return { ctx, product }
}

async function readJson(req: NextRequest): Promise<unknown | undefined> {
  try {
    return await req.json()
  } catch {
    return undefined
  }
}

function ruleOrServerError(err: unknown, action: string) {
  if (err instanceof ProductRuleError) return NextResponse.json({ error: err.message }, { status: 409 })
  console.error(`${action} partner product failed:`, err)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const own = await ownProduct(id)
  if (own.error) return own.error
  const parsed = PartnerProductSchema.safeParse(await readJson(req))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check the form' }, { status: 422 })
  try {
    await updatePartnerProduct(own.ctx.partner, id, parsed.data)
    revalidateMarketPages()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return ruleOrServerError(err, 'Update')
  }
}

// Quick show/hide from the products list
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const own = await ownProduct(id)
  if (own.error) return own.error
  const parsed = z.object({ isActive: z.boolean() }).safeParse(await readJson(req))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  await prisma.product.update({ where: { id }, data: { isActive: parsed.data.isActive } })
  revalidateMarketPages()
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const own = await ownProduct(id)
  if (own.error) return own.error
  try {
    await deletePartnerProduct(id)
    revalidateMarketPages()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return ruleOrServerError(err, 'Delete')
  }
}
