import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { generateTempPassword, hashPassword } from '@/lib/password'
import { isUniqueViolation, PartnerLoginUserSchema } from '@/lib/partners'

export const dynamic = 'force-dynamic'

// Adds another login to a partner (e.g. a shop's second staff member).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PartnerLoginUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const partner = await prisma.partner.findUnique({ where: { id }, select: { id: true } })
  if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const tempPassword = generateTempPassword()
  try {
    await prisma.partnerUser.create({
      data: {
        partnerId: id,
        name: parsed.data.userName,
        email: parsed.data.userEmail,
        passwordHash: await hashPassword(tempPassword),
      },
    })
    return NextResponse.json({ login: { email: parsed.data.userEmail, tempPassword } }, { status: 201 })
  } catch (err) {
    if (isUniqueViolation(err)) return NextResponse.json({ error: 'That login email is already in use.' }, { status: 409 })
    console.error('Create partner login failed:', err)
    return NextResponse.json({ error: 'Could not create login' }, { status: 500 })
  }
}
