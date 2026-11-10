import { z } from 'zod'
import { prisma } from '@/lib/db'
import { isUniqueViolation } from '@/lib/partners'
import { storeProductWhere } from '@/lib/market'
import { partnerProductSlug, partnerSku } from '@/lib/market-products'
import { ProductRuleError } from '@/lib/partner-products-db'

// URBANOVA Stockists (Reference I.6): partners who sell their own stock of official URBANOVA clothing.
// A stockist's listing of an URBANOVA item is a copy of the URBANOVA product (sourceProductId):
// name, description, category and photos always come from URBANOVA; the stockist sets price, stock and visibility.

const stock = z.number().int().min(0).max(100_000)

export const OfficialCopySchema = z.object({
  basePrice: z.number().int().min(100, 'Price must be at least GHS 1.00').max(100_000_000), // pesewas
  isActive: z.boolean(),
  variants: z
    .array(
      z.union([
        z.object({ id: z.string().min(1), stockQuantity: stock }), // an option already in the stockist's listing
        z.object({ sourceVariantId: z.string().min(1), stockQuantity: stock }), // a size/colour of the URBANOVA item
      ]),
    )
    .min(1, 'Add stock for at least one size')
    .max(60),
})

export const CreateOfficialCopySchema = OfficialCopySchema.extend({ sourceProductId: z.string().min(1) })

export type OfficialCopyInput = z.infer<typeof OfficialCopySchema>

type Partner = { id: string; slug: string; type: string }

const assertStockist = (partner: Partner) => {
  if (partner.type !== 'stockist') throw new ProductRuleError('Only URBANOVA stockists can sell URBANOVA items')
}

/** The URBANOVA item being copied: must be a live URBANOVA product. */
async function loadSource(sourceProductId: string) {
  const source = await prisma.product.findFirst({
    where: { id: sourceProductId, ...storeProductWhere },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
  })
  if (!source) throw new ProductRuleError('That URBANOVA item is not available')
  return source
}

export async function createOfficialCopy(partner: Partner, input: z.infer<typeof CreateOfficialCopySchema>) {
  assertStockist(partner)
  const source = await loadSource(input.sourceProductId)
  const existing = await prisma.product.findFirst({ where: { partnerId: partner.id, sourceProductId: source.id }, select: { id: true } })
  if (existing) throw new ProductRuleError('This item is already in your shop — edit it instead')

  const bySource = new Map(source.variants.map((v) => [v.id, v]))
  const variants = input.variants.map((v) => {
    const sv = 'sourceVariantId' in v ? bySource.get(v.sourceVariantId) : undefined
    if (!sv) throw new ProductRuleError('Unknown size — reload the page and try again')
    return { size: sv.size, color: sv.color, stockQuantity: v.stockQuantity }
  })

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.product.create({
        data: {
          partnerId: partner.id,
          sourceProductId: source.id,
          name: source.name,
          slug: partnerProductSlug(`${source.name} ${partner.slug}`),
          description: source.description,
          categoryId: source.categoryId,
          basePrice: input.basePrice,
          isActive: input.isActive,
          images: { create: source.images.map((img, i) => ({ url: img.url, sortOrder: i })) },
          variants: { create: variants.map((v) => ({ ...v, sku: partnerSku(partner.slug) })) },
        },
      })
    } catch (err) {
      if (isUniqueViolation(err)) {
        const dup = await prisma.product.findFirst({ where: { partnerId: partner.id, sourceProductId: source.id }, select: { id: true } })
        if (dup) throw new ProductRuleError('This item is already in your shop — edit it instead')
        continue // slug/SKU collision — regenerate
      }
      throw err
    }
  }
  throw new Error('Could not generate unique product identifiers')
}

/** Price, visibility and stock per size; sizes URBANOVA added later can be stocked too. Sizes are never removed (order history). */
export async function updateOfficialCopy(partner: Partner, productId: string, input: OfficialCopyInput) {
  assertStockist(partner)
  const copy = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } })
  if (!copy?.sourceProductId) throw new ProductRuleError('Not an URBANOVA item')
  const source = await prisma.product.findUnique({ where: { id: copy.sourceProductId }, include: { variants: true } })
  const own = new Set(copy.variants.map((v) => v.id))
  const taken = new Set(copy.variants.map((v) => `${v.size}|${v.color}`))
  const bySource = new Map((source?.variants ?? []).map((v) => [v.id, v]))

  const ops = []
  for (const v of input.variants) {
    if ('id' in v) {
      if (!own.has(v.id)) throw new ProductRuleError('Unknown size — reload the page and try again')
      ops.push(prisma.productVariant.update({ where: { id: v.id }, data: { stockQuantity: v.stockQuantity } }))
    } else {
      const sv = bySource.get(v.sourceVariantId)
      if (!sv) throw new ProductRuleError('Unknown size — reload the page and try again')
      const key = `${sv.size}|${sv.color}`
      if (taken.has(key)) continue
      taken.add(key)
      ops.push(
        prisma.productVariant.create({
          data: { productId, sku: partnerSku(partner.slug), size: sv.size, color: sv.color, stockQuantity: v.stockQuantity },
        }),
      )
    }
  }
  ops.push(prisma.product.update({ where: { id: productId }, data: { basePrice: input.basePrice, isActive: input.isActive } }))
  await prisma.$transaction(ops)
}

/** After URBANOVA edits one of its products, stockist copies pick up the official name, description, category and photos. */
export async function syncStockistCopies(sourceProductId: string) {
  const source = await prisma.product.findUnique({
    where: { id: sourceProductId },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!source) return
  const copies = await prisma.product.findMany({ where: { sourceProductId }, select: { id: true } })
  if (copies.length === 0) return
  await prisma.$transaction([
    ...copies.flatMap((c) => [
      prisma.product.update({
        where: { id: c.id },
        data: { name: source.name, description: source.description, categoryId: source.categoryId },
      }),
      prisma.productImage.deleteMany({ where: { productId: c.id } }),
      prisma.productImage.createMany({ data: source.images.map((img, i) => ({ productId: c.id, url: img.url, sortOrder: i })) }),
    ]),
  ])
}
