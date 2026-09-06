import { prisma } from './db'
import { Prisma } from '@prisma/client'

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true
    images: true
    variants: true
  }
}>

export type ProductSummary = Prisma.ProductGetPayload<{
  include: {
    images: true
    variants: { select: { priceOverride: true; stockQuantity: true } }
  }
}>

export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  try {
    return await prisma.product.findMany({
      where: { featured: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { select: { priceOverride: true, stockQuantity: true } },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

type ProductFilter = {
  category?: string
  size?: string
  color?: string
  sort?: string
}

export async function getProducts(filter: ProductFilter = {}): Promise<ProductSummary[]> {
  const where: Prisma.ProductWhereInput = {}

  if (filter.category) {
    where.category = { slug: filter.category }
  }
  if (filter.size || filter.color) {
    where.variants = {
      some: {
        ...(filter.size ? { size: filter.size } : {}),
        ...(filter.color ? { color: { contains: filter.color, mode: 'insensitive' } } : {}),
      },
    }
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (filter.sort === 'price_asc') orderBy = { basePrice: 'asc' }
  if (filter.sort === 'price_desc') orderBy = { basePrice: 'desc' }

  try {
    return await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { select: { priceOverride: true, stockQuantity: true } },
      },
      orderBy,
    })
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      },
    })
  } catch {
    return null
  }
}

export type CategoryRow = Prisma.CategoryGetPayload<Record<string, never>>

export async function getCategories(): Promise<CategoryRow[]> {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export function isProductInStock(product: ProductSummary): boolean {
  return product.variants.some((v) => v.stockQuantity > 0)
}

export function getProductPrice(product: { basePrice: number; variants: { priceOverride: number | null }[] }): number {
  return product.basePrice
}
