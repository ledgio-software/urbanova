import { PrismaClient } from '@prisma/client'

// Singleton pattern — prevents multiple Prisma Client instances in development
// (Next.js hot reloads would create a new instance on every reload without this)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
