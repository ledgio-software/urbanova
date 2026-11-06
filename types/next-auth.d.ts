import type { DefaultSession } from 'next-auth'

export type UserRole = 'admin' | 'partner' | 'rider'

declare module 'next-auth' {
  interface User {
    role?: UserRole
    partnerId?: string
  }
  interface Session {
    user: { role?: UserRole; partnerId?: string } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: UserRole
    partnerId?: string
  }
}
