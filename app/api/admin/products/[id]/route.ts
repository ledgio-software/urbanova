import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

const VariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  stockQuantity: z.number().int().min(0),
})

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).optional(),
  basePrice: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(VariantSchema).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { images, variants, ...data } = parsed.data

  if (images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: id } })
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url, idx) => ({
          productId: id,
          url,
          sortOrder: idx,
        })),
      })
    }
  }

  if (variants !== undefined) {
    // Delete variants removed in form
    const existingVariants = await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } })
    const keepIds = new Set(variants.map((v) => v.id).filter(Boolean) as string[])
    const deleteIds = existingVariants.filter((v) => !keepIds.has(v.id)).map((v) => v.id)
    if (deleteIds.length > 0) {
      await prisma.productVariant.deleteMany({ where: { id: { in: deleteIds } } })
    }

    for (const v of variants) {
      if (v.id) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
          },
        })
      } else {
        const colorCode = v.color.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'BLK'
        const sizeCode = v.size.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'OS'
        const generatedSku = `URB-VAR-${id.slice(-4).toUpperCase()}-${colorCode}-${sizeCode}-${Math.floor(1000 + Math.random() * 9000)}`
        await prisma.productVariant.create({
          data: {
            productId: id,
            sku: v.sku || generatedSku,
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
          },
        })
      }
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
    },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Delete related images and variants first to clean up foreign keys
  await prisma.productImage.deleteMany({ where: { productId: id } })
  await prisma.productVariant.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
