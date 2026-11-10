import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { isUniqueViolation } from '@/lib/partners'
import { partnerProductSlug, partnerSku, type PartnerProductInput } from '@/lib/market-products'

type Partner = { id: string; slug: string }

export class ProductRuleError extends Error {}

/** Market categories only — partners can't put items into URBANOVA's own Shop categories. */
export async function assertMarketCategory(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { kind: true } })
  if (category?.kind !== 'market') throw new ProductRuleError('Choose a Nova Market category')
}

export async function createPartnerProduct(partner: Partner, input: PartnerProductInput) {
  await assertMarketCategory(input.categoryId)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.product.create({
        data: {
          partnerId: partner.id,
          name: input.name,
          slug: partnerProductSlug(input.name),
          description: input.description,
          categoryId: input.categoryId,
          basePrice: input.basePrice,
          isActive: input.isActive,
          images: { create: input.images.map((url, i) => ({ url, sortOrder: i })) },
          variants: {
            create: input.variants.map((v) => ({
              sku: partnerSku(partner.slug),
              size: v.size,
              color: v.color,
              stockQuantity: v.stockQuantity,
              priceOverride: v.priceOverride,
            })),
          },
        },
      })
    } catch (err) {
      if (isUniqueViolation(err)) continue // slug/SKU collision — regenerate
      throw err
    }
  }
  throw new Error('Could not generate unique product identifiers')
}

/** Replaces images, updates/creates/removes options. An option that has been ordered can't be removed. */
export async function updatePartnerProduct(partner: Partner, productId: string, input: PartnerProductInput) {
  await assertMarketCategory(input.categoryId)
  const existing = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true, _count: { select: { orderItems: true } } },
  })
  const existingIds = new Set(existing.map((v) => v.id))
  const keptIds = new Set(input.variants.flatMap((v) => (v.id ? [v.id] : [])))

  for (const id of keptIds) {
    if (!existingIds.has(id)) throw new ProductRuleError('Unknown option — reload the page and try again')
  }
  const removed = existing.filter((v) => !keptIds.has(v.id))
  if (removed.some((v) => v._count.orderItems > 0)) {
    throw new ProductRuleError('An option that has already been ordered can’t be removed — set its stock to 0 instead')
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        basePrice: input.basePrice,
        isActive: input.isActive,
      },
    }),
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productImage.createMany({ data: input.images.map((url, i) => ({ productId, url, sortOrder: i })) }),
    ...removed.map((v) => prisma.productVariant.delete({ where: { id: v.id } })),
    ...input.variants.map((v) =>
      v.id
        ? prisma.productVariant.update({
            where: { id: v.id },
            data: { size: v.size, color: v.color, stockQuantity: v.stockQuantity, priceOverride: v.priceOverride },
          })
        : prisma.productVariant.create({
            data: {
              productId,
              sku: partnerSku(partner.slug),
              size: v.size,
              color: v.color,
              stockQuantity: v.stockQuantity,
              priceOverride: v.priceOverride,
            },
          }),
    ),
  ]
  await prisma.$transaction(ops)
}

/** A product that has been ordered stays for order history — the partner hides it instead. */
export async function deletePartnerProduct(productId: string) {
  const ordered = await prisma.orderItem.count({ where: { variant: { productId } } })
  if (ordered > 0) throw new ProductRuleError('This item has orders, so it can’t be deleted — hide it instead')
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productVariant.deleteMany({ where: { productId } }),
    prisma.product.delete({ where: { id: productId } }),
  ])
}
