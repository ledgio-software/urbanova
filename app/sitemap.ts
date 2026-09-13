import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/legal/shipping-returns`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/terms-of-service`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  let categoryRoutes: MetadataRoute.Sitemap = []

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, createdAt: true } }),
      prisma.category.findMany({ select: { slug: true } }),
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
  } catch {
    // DB unavailable during build
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
