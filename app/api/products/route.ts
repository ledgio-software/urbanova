import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sellableProductWhere } from '@/lib/market'

export async function GET() {
  const products = await prisma.product.findMany({
    where: sellableProductWhere,
    include: {
      category: true,
      variants: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}
