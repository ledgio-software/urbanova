// Copy source: docs/URBANOVA_REFERENCE.md Part A.8, Part D.6, Part F.1
// Security: All input validated with Zod before touching the DB.
// Orders are created as pending_payment — only the Paystack webhook marks them paid.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { initializePayment, generateReference } from '@/lib/paystack'
import { CheckoutSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const input = parsed.data

  // Resolve delivery zone
  const zone = await prisma.deliveryZone.findUnique({ where: { id: input.deliveryZoneId } })
  if (!zone) {
    return NextResponse.json({ error: 'Invalid delivery zone' }, { status: 400 })
  }

  // Resolve variants and compute line prices
  const variantIds = input.cartItems.map((i) => i.variantId)
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true, basePrice: true } } },
  })

  if (variants.length !== variantIds.length) {
    return NextResponse.json({ error: 'One or more items are no longer available' }, { status: 400 })
  }

  // Check stock
  for (const cartItem of input.cartItems) {
    const variant = variants.find((v) => v.id === cartItem.variantId)!
    if (variant.stockQuantity < cartItem.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${variant.product.name} (${variant.size}/${variant.color})` },
        { status: 400 },
      )
    }
  }

  const orderItems = input.cartItems.map((cartItem) => {
    const variant = variants.find((v) => v.id === cartItem.variantId)!
    return {
      variantId: cartItem.variantId,
      quantity: cartItem.quantity,
      unitPrice: variant.priceOverride ?? variant.product.basePrice,
    }
  })

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const total = subtotal + zone.fee

  // Find or create customer record
  let customer = await prisma.customer.findFirst({ where: { email: input.email } })
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: input.name, email: input.email, phone: input.phone },
    })
  }

  // Create order as pending_payment
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: 'pending_payment',
      subtotal,
      deliveryFee: zone.fee,
      total,
      deliveryZone: zone.name,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      items: { create: orderItems },
    },
  })

  // Initialise Paystack payment
  const reference = generateReference(order.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const paystack = await initializePayment({
    email: input.email,
    amountPesewas: total,
    reference,
    callbackUrl: `${siteUrl}/order-confirmation/${order.id}`,
    metadata: { orderId: order.id, customerName: input.name },
  })

  // Store the reference so the webhook can match it
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: reference },
  })

  return NextResponse.json({ authorizationUrl: paystack.data.authorization_url, orderId: order.id })
}
