import { prisma } from '@/lib/db'
import { cache } from 'react'
import { marketProductWhere } from '@/lib/market'
import { normalizeHost, subdomainSlug } from '@/lib/partner-hosts'

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

const partnerPageSelect = {
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
  contactEmail: true,
  customDomain: true,
  products: { where: marketProductWhere, include: cardInclude, orderBy: { createdAt: 'desc' as const } },
}

export type LivePartnerPage = NonNullable<Awaited<ReturnType<typeof getLivePartnerPage>>>

export async function getLivePartnerPage(slug: string) {
  try {
    return await prisma.partner.findFirst({ where: { slug, status: 'active' }, select: partnerPageSelect })
  } catch {
    return null
  }
}

/** The live partner whose website is served on this host: their own domain (with or without www) or <slug>.<root>. */
export const getSitePartner = cache(async (rawHost: string) => {
  const host = normalizeHost(decodeURIComponent(rawHost))
  const slug = subdomainSlug(host)
  const domain = host.replace(/^www\./, '')
  try {
    return await prisma.partner.findFirst({
      where: { status: 'active', OR: [{ customDomain: domain }, ...(slug ? [{ slug }] : [])] },
      select: partnerPageSelect,
    })
  } catch {
    return null
  }
})

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
