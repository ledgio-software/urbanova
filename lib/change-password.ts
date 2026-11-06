import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/password'
import { getIp, rateLimit } from '@/lib/rate-limit'

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(200),
  })
  .refine((v) => v.newPassword !== v.currentPassword, { message: 'Choose a different password', path: ['newPassword'] })

/**
 * Shared "change my password" handler for partner and rider dashboards.
 * `account` is the signed-in account (null → 401); `save` stores the new hash and clears mustChangePassword.
 */
export async function handlePasswordChange(
  req: NextRequest,
  scope: string,
  account: { passwordHash: string } | null,
  save: (passwordHash: string) => Promise<unknown>,
) {
  if (!rateLimit(`${scope}-password:${getIp(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
  }
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  if (!(await verifyPassword(parsed.data.currentPassword, account.passwordHash))) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }
  await save(await hashPassword(parsed.data.newPassword))
  return NextResponse.json({ ok: true })
}
