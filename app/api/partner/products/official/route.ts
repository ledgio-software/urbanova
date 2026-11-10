import { NextRequest, NextResponse } from 'next/server'
import { getPartnerContext } from '@/lib/authz'
import { ProductRuleError } from '@/lib/partner-products-db'
import { revalidateMarketPages } from '@/lib/market-cache'
import { CreateOfficialCopySchema, createOfficialCopy } from '@/lib/stockist'

export const dynamic = 'force-dynamic'

// A stockist adds an official URBANOVA item (from their own stock) to their shop.
export async function POST(req: NextRequest) {
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })
  if (ctx.partner.type !== 'stockist') return NextResponse.json({ error: 'Only URBANOVA stockists can sell URBANOVA items' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateOfficialCopySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check the form' }, { status: 422 })

  try {
    const product = await createOfficialCopy(ctx.partner, parsed.data)
    revalidateMarketPages()
    return NextResponse.json({ id: product.id }, { status: 201 })
  } catch (err) {
    if (err instanceof ProductRuleError) return NextResponse.json({ error: err.message }, { status: 409 })
    console.error('Add URBANOVA item failed:', err)
    return NextResponse.json({ error: 'Could not add the item' }, { status: 500 })
  }
}
