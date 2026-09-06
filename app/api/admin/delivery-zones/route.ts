import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } })
  return NextResponse.json(zones)
}

const ZoneSchema = z.object({
  name: z.string().min(1),
  estimatedDays: z.string().min(1),
  fee: z.number().int().nonnegative(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ZoneSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  const zone = await prisma.deliveryZone.create({ data: parsed.data })
  return NextResponse.json(zone, { status: 201 })
}
