import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { revalidateMarketPages } from '@/lib/market-cache'

export const dynamic = 'force-dynamic'

async function marketCategory(id: string) {
  const c = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  return c?.kind === 'market' ? c : null
}

// Rename only — the slug (URL) stays the same so links keep working.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await marketCategory(id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = z.object({ name: z.string().trim().min(2).max(40) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Enter a name (2–40 characters)' }, { status: 422 })
  await prisma.category.update({ where: { id }, data: { name: parsed.data.name } })
  revalidateMarketPages()
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const c = await marketCategory(id)
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (c._count.products > 0) return NextResponse.json({ error: 'Products use this category — move them first' }, { status: 409 })
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
