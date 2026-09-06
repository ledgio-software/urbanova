import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ZoneSchema = z.object({
  name: z.string().min(1).optional(),
  estimatedDays: z.string().min(1).optional(),
  fee: z.number().int().nonnegative().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = ZoneSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  const zone = await prisma.deliveryZone.update({ where: { id }, data: parsed.data })
  return NextResponse.json(zone)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.deliveryZone.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
