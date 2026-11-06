import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { generateTempPassword, hashPassword } from '@/lib/password'
import { isUniqueViolation } from '@/lib/partners'
import { CreateRiderSchema } from '@/lib/riders'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const riders = await prisma.rider.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, phone: true, email: true, vehicle: true, status: true, lastLoginAt: true },
  })
  return NextResponse.json(riders)
}

// Creates a rider login; the one-time password is returned once for the admin to share.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateRiderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const tempPassword = generateTempPassword()
  try {
    const rider = await prisma.rider.create({ data: { ...parsed.data, passwordHash: await hashPassword(tempPassword) } })
    return NextResponse.json({ id: rider.id, login: { email: rider.email, tempPassword } }, { status: 201 })
  } catch (err) {
    if (isUniqueViolation(err)) return NextResponse.json({ error: 'That login email is already in use.' }, { status: 409 })
    console.error('Create rider failed:', err)
    return NextResponse.json({ error: 'Could not create rider' }, { status: 500 })
  }
}
