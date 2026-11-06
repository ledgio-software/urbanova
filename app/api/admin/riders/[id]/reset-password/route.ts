import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { generateTempPassword, hashPassword } from '@/lib/password'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const tempPassword = generateTempPassword()
  try {
    const rider = await prisma.rider.update({
      where: { id },
      data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true },
    })
    return NextResponse.json({ login: { email: rider.email, tempPassword } })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
