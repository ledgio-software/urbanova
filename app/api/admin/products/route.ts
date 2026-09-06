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

const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().int().positive(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      featured: parsed.data.featured ?? false,
      tags: parsed.data.tags ?? [],
    },
  })
  return NextResponse.json(product, { status: 201 })
}
