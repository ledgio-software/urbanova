import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { authConfig } from './auth.config'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { getIp, rateLimit } from '@/lib/rate-limit'

// 10 attempts per IP per 15 minutes on each login form (CLAUDE.md: rate-limit login)
const LOGIN_LIMIT = 10
const LOGIN_WINDOW_MS = 15 * 60_000

const PartnerLoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Admin — provider id stays 'credentials' so the existing /admin/login form keeps working
    Credentials({
      id: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!rateLimit(`admin-login:${getIp(request)}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) return null
        const { username, password } = credentials as { username: string; password: string }
        if (
          username === process.env.ADMIN_USERNAME &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: 'admin', name: 'Admin', email: 'admin@urbanova.store', role: 'admin' }
        }
        return null
      },
    }),
    // Marketplace partners — accounts created by the admin (Reference Part I)
    Credentials({
      id: 'partner',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!rateLimit(`partner-login:${getIp(request)}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) return null
        const parsed = PartnerLoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.partnerUser.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { partner: { select: { status: true } } },
        })
        if (!user || user.partner.status === 'suspended') return null
        if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null

        await prisma.partnerUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
        return { id: user.id, name: user.name, email: user.email, role: 'partner', partnerId: user.partnerId }
      },
    }),
  ],
})
