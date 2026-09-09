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

      {/* MoMo Payment Instructions Card */}
      {!isPaid && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-8 text-brand-black">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-amber-500 text-white font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              Action Required
            </span>
            <h2 className="font-headline text-lg uppercase tracking-wider text-amber-950">
              Mobile Money Payment Instructions
            </h2>
          </div>
          <p className="text-sm font-body text-amber-900 mb-4">
            Please transfer <strong>{formatPrice(order.total)}</strong> via Mobile Money to complete your order:
          </p>

          <div className="bg-white border border-amber-200 rounded p-4 space-y-3 text-sm font-body mb-4">
            <div className="flex justify-between items-center pb-2 border-b border-amber-100">
              <span className="text-amber-800 font-medium">MoMo Number:</span>
              <span className="font-mono font-bold text-base text-brand-black tracking-wide">0557786833</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-amber-100">
              <span className="text-amber-800 font-medium">Account Name:</span>
              <span className="font-bold text-brand-black">ISAAC OKYERE</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-amber-100">
              <span className="text-amber-800 font-medium">Amount to Send:</span>
              <span className="font-bold text-brand-red text-base">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-800 font-medium">Reference:</span>
              <span className="font-mono font-bold text-brand-black">#{shortId}</span>
            </div>
          </div>

          <p className="text-xs font-body text-amber-900/80 leading-relaxed">
            💡 <strong>Important:</strong> Enter <strong>#{shortId}</strong> in the reference field when making your Mobile Money transfer. Once sent, we will verify your payment and process your shipment!
          </p>
        </div>
      )}

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
