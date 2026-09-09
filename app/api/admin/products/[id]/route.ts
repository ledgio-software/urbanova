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

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).optional(),
  basePrice: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { images, ...data } = parsed.data

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

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
