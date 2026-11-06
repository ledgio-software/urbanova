import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPartnerContext } from '@/lib/authz'
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/password'
import { getIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(200),
  })
  .refine((v) => v.newPassword !== v.currentPassword, { message: 'Choose a different password', path: ['newPassword'] })

export async function POST(req: NextRequest) {
  if (!rateLimit(`partner-password:${getIp(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
  }
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = ChangePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid password' }, { status: 422 })
  }
  if (!(await verifyPassword(parsed.data.currentPassword, ctx.user.passwordHash))) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  await prisma.partnerUser.update({
    where: { id: ctx.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), mustChangePassword: false },
  })
  return NextResponse.json({ ok: true })
}
