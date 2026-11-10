import { prisma } from '@/lib/db'
import { marketProductWhere } from '@/lib/market'

// Public Nova Market data — always filtered through marketProductWhere / active partners.

const cardInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  variants: { select: { priceOverride: true, stockQuantity: true } },
  partner: { select: { name: true } },
}

export async function getMarketProducts(categorySlug?: string) {
  try {
    return await prisma.product.findMany({
      // Stockists' copies of URBANOVA items stay on their own page — Nova Market shows partners' own goods
      where: { ...marketProductWhere, sourceProductId: null, ...(categorySlug ? { category: { slug: categorySlug, kind: 'market' } } : {}) },
      include: cardInclude,
      orderBy: { createdAt: 'desc' },
      take: 120,
    })
  } catch {
    return []
  }
}

export async function getMarketCategoriesInUse() {
  try {
    return await prisma.category.findMany({
      where: { kind: 'market', products: { some: marketProductWhere } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true },
    })
  } catch {
    return []
  }
}

export async function getLivePartners() {
  try {
    return await prisma.partner.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, tagline: true, logoUrl: true, location: true, type: true },
    })
  } catch {
    return []
  }
}

export async function getLivePartnerPage(slug: string) {
  try {
    return await prisma.partner.findFirst({
      where: { slug, status: 'active' },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        location: true,
        type: true,
        contactPhone: true,
        products: { where: marketProductWhere, include: cardInclude, orderBy: { createdAt: 'desc' } },
      },
    })
  } catch {
    return null
  }
}

/** Other items from the same partner, for "More from …" on a product page. */
export async function getMoreFromPartner(partnerId: string, excludeId: string) {
  try {
    return await prisma.product.findMany({
      where: { ...marketProductWhere, partnerId, id: { not: excludeId } },
      include: cardInclude,
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
  } catch {
    return []
  }
}
