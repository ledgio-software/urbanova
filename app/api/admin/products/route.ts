import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      variants: { select: { stockQuantity: true } },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

const VariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  stockQuantity: z.number().int().min(0),
})

const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().int().positive(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(VariantSchema).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { images, variants, ...data } = parsed.data

  const product = await prisma.product.create({
    data: {
      ...data,
      featured: data.featured ?? false,
      tags: data.tags ?? [],
      images: images?.length
        ? {
            create: images.map((url, idx) => ({
              url,
              sortOrder: idx,
            })),
          }
        : undefined,
      variants: variants?.length
        ? {
            create: variants.map((v) => {
              const styleCode = data.slug.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'STYLE'
              const colorCode = v.color.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'BLK'
              const sizeCode = v.size.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'OS'
              const generatedSku = `URB-CAT-${styleCode}-${colorCode}-${sizeCode}-${Math.floor(1000 + Math.random() * 9000)}`
              return {
                sku: v.sku || generatedSku,
                size: v.size,
                color: v.color,
                stockQuantity: v.stockQuantity,
              }
            }),
          }
        : undefined,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      category: true,
    },
  })
  return NextResponse.json(product, { status: 201 })
}
