import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { generateTempPassword, hashPassword } from '@/lib/password'
import { adminPartnerData, CreatePartnerSchema, isUniqueViolation } from '@/lib/partners'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true, users: true } } },
  })
  return NextResponse.json(partners)
}

// Creates the partner and its first login. The one-time password is returned once,
// for the admin to share with the partner (e.g. on WhatsApp); only its hash is stored.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreatePartnerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { userName, userEmail, ...partnerInput } = parsed.data
  const tempPassword = generateTempPassword()

  try {
    const partner = await prisma.partner.create({
      data: {
        ...adminPartnerData(partnerInput),
        users: { create: { name: userName, email: userEmail, passwordHash: await hashPassword(tempPassword) } },
      },
    })
    return NextResponse.json({ id: partner.id, login: { email: userEmail, tempPassword } }, { status: 201 })
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'That page address, website address or login email is already in use.' }, { status: 409 })
    }
    console.error('Create partner failed:', err)
    return NextResponse.json({ error: 'Could not create partner' }, { status: 500 })
  }
}
