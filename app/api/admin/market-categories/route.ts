import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { SUGGESTED_MARKET_CATEGORIES } from '@/lib/market'
import { slugify } from '@/lib/partners'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const categories = await prisma.category.findMany({
    where: { kind: 'market' },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(categories)
}

const CreateSchema = z.union([z.object({ name: z.string().trim().min(2).max(40) }), z.object({ suggested: z.literal(true) })])

// Market category slugs get an "nm-" prefix so they never collide with URBANOVA's Shop category slugs.
const marketSlug = (name: string) => `nm-${slugify(name)}`

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Enter a name (2–40 characters)' }, { status: 422 })

  const names = 'suggested' in parsed.data ? SUGGESTED_MARKET_CATEGORIES : [parsed.data.name]
  const existing = new Set((await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug))
  const toCreate = names.filter((n) => !existing.has(marketSlug(n)))
  if (toCreate.length === 0) return NextResponse.json({ error: 'That category already exists' }, { status: 409 })

  await prisma.category.createMany({
    data: toCreate.map((name, i) => ({ name, slug: marketSlug(name), kind: 'market' as const, sortOrder: i })),
  })
  return NextResponse.json({ created: toCreate.length }, { status: 201 })
}
