import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getRiderContext } from '@/lib/authz'
import { handlePasswordChange } from '@/lib/change-password'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ctx = await getRiderContext()
  return handlePasswordChange(req, 'rider', ctx?.rider ?? null, (passwordHash) =>
    prisma.rider.update({ where: { id: ctx!.rider.id }, data: { passwordHash, mustChangePassword: false } }),
  )
}
