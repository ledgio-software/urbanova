import { NextRequest, NextResponse } from 'next/server'
import { getPartnerContext } from '@/lib/authz'
import { PartnerProductSchema } from '@/lib/market-products'
import { createPartnerProduct, ProductRuleError } from '@/lib/partner-products-db'
import { revalidateMarketPages } from '@/lib/market-cache'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PartnerProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check the form' }, { status: 422 })

  try {
    const product = await createPartnerProduct(ctx.partner, parsed.data)
    revalidateMarketPages()
    return NextResponse.json({ id: product.id }, { status: 201 })
  } catch (err) {
    if (err instanceof ProductRuleError) return NextResponse.json({ error: err.message }, { status: 400 })
    console.error('Create partner product failed:', err)
    return NextResponse.json({ error: 'Could not save the product' }, { status: 500 })
  }
}
