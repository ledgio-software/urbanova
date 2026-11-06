import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { sellableProductWhere } from '@/lib/market'
import { POLICY_SLUGS } from '@/lib/content/policy-index'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/vision-mission`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/movement`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/market`, changeFrequency: 'daily', priority: 0.8 },
    ...POLICY_SLUGS.map((slug) => ({
      url: `${siteUrl}/legal/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    })),
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  let categoryRoutes: MetadataRoute.Sitemap = []
  let partnerRoutes: MetadataRoute.Sitemap = []

  try {
    const [products, categories, partners] = await Promise.all([
      prisma.product.findMany({ where: sellableProductWhere, select: { slug: true, createdAt: true } }),
      prisma.category.findMany({ where: { kind: 'store' }, select: { slug: true } }),
      prisma.partner.findMany({ where: { status: 'active' }, select: { slug: true, updatedAt: true } }),
    ])
    productRoutes = products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    categoryRoutes = categories.map((c) => ({
      url: `${siteUrl}/shop/${c.slug}`,
      changeFrequency: 'daily',
      priority: 0.7,
    }))
    partnerRoutes = partners.map((p) => ({
      url: `${siteUrl}/partners/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch {
    // DB unavailable during build
  }

  return [...staticRoutes, ...categoryRoutes, ...partnerRoutes, ...productRoutes]
}
