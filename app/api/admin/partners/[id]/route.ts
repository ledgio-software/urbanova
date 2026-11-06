import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { AdminPartnerSchema, adminPartnerData, isUniqueViolation } from '@/lib/partners'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, mustChangePassword: true, lastLoginAt: true, createdAt: true } },
      _count: { select: { products: true } },
    },
  })
  if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(partner)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = AdminPartnerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  try {
    const partner = await prisma.partner.update({ where: { id }, data: adminPartnerData(parsed.data) })
    return NextResponse.json({ id: partner.id })
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'That page address is already in use.' }, { status: 409 })
    }
    if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('Update partner failed:', err)
    return NextResponse.json({ error: 'Could not update partner' }, { status: 500 })
  }
}
