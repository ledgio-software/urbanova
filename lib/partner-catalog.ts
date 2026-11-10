import { prisma } from '@/lib/db'

export async function getMarketCategories() {
  return prisma.category.findMany({ where: { kind: 'market' }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true } })
}
