import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getPartnerContext } from '@/lib/authz'
import { handlePasswordChange } from '@/lib/change-password'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ctx = await getPartnerContext()
  return handlePasswordChange(req, 'partner', ctx?.user ?? null, (passwordHash) =>
    prisma.partnerUser.update({ where: { id: ctx!.user.id }, data: { passwordHash, mustChangePassword: false } }),
  )
}
