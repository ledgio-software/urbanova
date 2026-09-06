// Copy source: docs/URBANOVA_REFERENCE.md Part A.8 — Payment Integration Policy
// CRITICAL: signature MUST be validated before trusting any payload data.
// Orders are only marked paid here — never on the client redirect.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateWebhookSignature } from '@/lib/paystack'
import { sendOrderConfirmation } from '@/lib/email'

// Disable body parsing so we get the raw bytes for HMAC verification
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-paystack-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const rawBody = await req.text()

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: { reference: string; status: string; amount: number } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle successful charge events
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const { reference, status } = event.data

  if (status !== 'success') {
    return NextResponse.json({ received: true })
  }

  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
      customer: true,
    },
  })

  if (!order) {
    // Unknown reference — log and acknowledge (don't 500, Paystack will retry)
    console.error(`Webhook: no order found for reference ${reference}`)
    return NextResponse.json({ received: true })
  }

  if (order.status !== 'pending_payment') {
    // Already processed (idempotency guard)
    return NextResponse.json({ received: true })
  }

  // Mark order paid
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'paid' },
  })

  // Look up delivery zone for estimated days
  const zone = await prisma.deliveryZone.findFirst({ where: { name: order.deliveryZone } })

  // Send confirmation email (non-fatal if it fails)
  if (order.customer) {
    try {
      await sendOrderConfirmation({
        to: order.customer.email,
        customerName: order.customer.name,
        orderId: order.id,
        items: order.items.map((item) => ({
          productName: item.variant.product.name,
          size: item.variant.size,
          color: item.variant.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        deliveryZone: order.deliveryZone,
        estimatedDays: zone?.estimatedDays ?? '3–5 business days',
      })
    } catch (err) {
      console.error('Failed to send order confirmation email:', err)
    }
  }

  return NextResponse.json({ received: true })
}
