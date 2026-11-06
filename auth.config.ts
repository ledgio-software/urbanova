import type { NextAuthConfig } from 'next-auth'

// Edge-safe Auth.js config shared by middleware.ts and auth.ts.
// No providers here: they need Prisma and Node crypto, which can't run in middleware.
// The role ('admin' | 'partner') and partnerId travel in the JWT so middleware can gate routes.
export const authConfig = {
  providers: [],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.partnerId = user.partnerId
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      session.user.role = token.role
      session.user.partnerId = token.partnerId
      return session
    },
  },
} satisfies NextAuthConfig
