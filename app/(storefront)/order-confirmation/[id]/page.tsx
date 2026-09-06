// Copy source: docs/URBANOVA_REFERENCE.md Part D.7 and Part E.6
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let order: {
    id: string
    status: string
    total: number
    subtotal: number
    deliveryFee: number
    deliveryZone: string
    deliveryAddress: string
    customer: { name: string; email: string } | null
    items: {
      id: string
      quantity: number
      unitPrice: number
      variant: { size: string; color: string; product: { name: string; slug: string } }
    }[]
  } | null = null

  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            variant: {
              select: {
                size: true,
                color: true,
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    })
  } catch {
    // DB unavailable — handled below
  }

  if (!order) notFound()

  const shortId = order.id.slice(-8).toUpperCase()
  const isPaid = order.status === 'paid' || order.status === 'packed' || order.status === 'shipped' || order.status === 'delivered'

  // Find estimated delivery days from delivery zone name
  let estimatedDays = '3–5 business days'
  try {
    const zone = await prisma.deliveryZone.findFirst({ where: { name: order.deliveryZone } })
    if (zone) estimatedDays = zone.estimatedDays
  } catch {
    // fallback to default
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        {isPaid ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-headline text-display-md uppercase text-brand-black">You&apos;re In.</h1>
            <p className="mt-2 font-body text-brand-black/60">
              Order <strong>#{shortId}</strong> confirmed — your URBANOVA pieces are on the way.
            </p>
            <p className="mt-1 font-body text-brand-black/50 text-sm">
              Estimated delivery: {estimatedDays}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-headline text-display-md uppercase text-brand-black">Payment Pending</h1>
            <p className="mt-2 font-body text-brand-black/60">
              Order <strong>#{shortId}</strong> is waiting for payment confirmation.
            </p>
            <p className="mt-1 font-body text-brand-black/50 text-sm">
              If you completed payment, it will be confirmed shortly.
            </p>
          </>
        )}
      </div>

      {/* Order items */}
      <div className="border border-brand-black/10 rounded p-6 mb-6">
        <h2 className="font-headline text-base uppercase tracking-widest text-brand-black mb-4">Your Order</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm font-body">
              <div>
                <p className="text-brand-black">{item.variant.product.name}</p>
                <p className="text-brand-black/50 text-xs mt-0.5">{item.variant.size} / {item.variant.color} × {item.quantity}</p>
              </div>
              <p className="text-brand-black">{formatPrice(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-black/10 space-y-2 text-sm font-body">
          <div className="flex justify-between text-brand-black/60">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-brand-black/60">
            <span>Delivery ({order.deliveryZone})</span><span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-brand-black pt-1 border-t border-brand-black/10">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="border border-brand-black/10 rounded p-6 mb-10">
        <h2 className="font-headline text-base uppercase tracking-widest text-brand-black mb-2">Delivery To</h2>
        <p className="text-sm font-body text-brand-black/70">{order.customer?.name}</p>
        <p className="text-sm font-body text-brand-black/70 mt-1 whitespace-pre-wrap">{order.deliveryAddress}</p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/shop"
          className="flex-1 bg-brand-red text-white text-center font-body text-sm uppercase tracking-widest py-4 hover:bg-brand-red/80 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/contact"
          className="flex-1 border border-brand-black/20 text-center font-body text-sm uppercase tracking-widest py-4 hover:border-brand-black transition-colors text-brand-black"
        >
          Questions? Contact Us
        </Link>
      </div>
    </div>
  )
}
