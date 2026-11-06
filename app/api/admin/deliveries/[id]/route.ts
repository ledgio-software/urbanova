import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { isFinal, moveJob } from '@/lib/delivery'

export const dynamic = 'force-dynamic'

const ActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('assign'), riderId: z.string().min(1) }),
  z.object({ action: z.literal('cancel'), note: z.string().trim().max(300).optional() }),
  // Override when the customer can't give their code (e.g. lost it) and delivery is confirmed another way
  z.object({ action: z.literal('mark_delivered'), note: z.string().trim().min(3, 'Say how delivery was confirmed').max(300) }),
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid action' }, { status: 422 })

  const job = await prisma.deliveryJob.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (isFinal(job.status)) return NextResponse.json({ error: `This delivery is already ${job.status}` }, { status: 409 })

  const a = parsed.data
  if (a.action === 'assign') {
    // (Re)assign: from pending, assigned (swap rider) or failed (try again). Not once the parcel is with a rider.
    if (!['pending', 'assigned', 'failed'].includes(job.status)) {
      return NextResponse.json({ error: 'The current rider already has the parcel' }, { status: 409 })
    }
    const rider = await prisma.rider.findUnique({ where: { id: a.riderId }, select: { name: true, status: true } })
    if (rider?.status !== 'active') return NextResponse.json({ error: 'That rider is not active' }, { status: 400 })
    await moveJob(job, 'assigned', 'admin', {
      note: `Assigned to ${rider.name}`,
      data: { rider: { connect: { id: a.riderId } }, codeAttempts: 0, failureReason: null },
    })
  } else if (a.action === 'cancel') {
    await moveJob(job, 'cancelled', 'admin', { note: a.note || undefined })
  } else {
    await moveJob(job, 'delivered', 'admin', { note: `Marked delivered by admin: ${a.note}` })
  }
  return NextResponse.json({ ok: true })
}
