import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { generateTempPassword, hashPassword } from '@/lib/password'

export const dynamic = 'force-dynamic'

// Issues a new one-time password (shown once to the admin); the partner must change it on next login.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, userId } = await params

  const user = await prisma.partnerUser.findUnique({ where: { id: userId }, select: { partnerId: true, email: true } })
  if (!user || user.partnerId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const tempPassword = generateTempPassword()
  await prisma.partnerUser.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true },
  })
  return NextResponse.json({ login: { email: user.email, tempPassword } })
}
