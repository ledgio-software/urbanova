import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Check the status of your URBANOVA order.',
}

export const dynamic = 'force-dynamic'

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = await searchParams
  const searchQuery = query?.trim() ?? ''

  let orderResult: {
    id: string
    status: string
    total: number
    deliveryZone: string
    deliveryAddress: string
    createdAt: Date
    paymentMethod: string
    customer: { name: string; phone: string } | null
    items: {
      id: string
      quantity: number
      unitPrice: number
      variant: { size: string; color: string; product: { name: string } }
    }[]
  } | null = null

  let searched = false
  if (searchQuery) {
    searched = true
    // Strip leading # if provided
    const cleanId = searchQuery.replace(/^#/, '')

    try {
      orderResult = await prisma.order.findFirst({
        where: {
          OR: [
            { id: { endsWith: cleanId, mode: 'insensitive' } },
            { id: cleanId },
            { customer: { phone: { contains: cleanId } } },
          ],
        },
        include: {
          customer: { select: { name: true, phone: true } },
          items: {
            include: {
              variant: {
                select: {
                  size: true,
                  color: true,
                  product: { select: { name: true } },
                },
              },
            },
          },
        },
      })
    } catch {
      // DB error handling
    }
  }

  const STATUS_STEPS = [
    { key: 'pending_payment', label: 'Payment Pending', description: 'Order created, awaiting MoMo payment transfer.' },
    { key: 'paid', label: 'Payment Verified', description: 'Payment confirmed by URBANOVA team.' },
    { key: 'packed', label: 'Order Packed', description: 'Your streetwear pieces are packed and ready.' },
    { key: 'shipped', label: 'Out for Delivery', description: 'With courier on the way to your delivery zone.' },
    { key: 'delivered', label: 'Delivered', description: 'Order successfully delivered to customer.' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="font-headline text-display-md uppercase text-brand-black">Track Your Order</h1>
        <p className="mt-2 font-body text-brand-black/60 text-sm">
          Enter your Order ID (e.g. <span className="font-mono font-bold text-brand-black">#8A1B2C3D</span>) or your Mobile Money phone number.
        </p>
      </div>

      {/* Search Form */}
      <form action="/track-order" method="GET" className="flex gap-2 max-w-md mx-auto mb-12">
        <input
          type="text"
          name="query"
          defaultValue={searchQuery}
          placeholder="e.g. 8A1B2C3D or 0557786833"
          required
          className="flex-1 border border-brand-black/20 bg-transparent px-4 py-3 text-sm font-body text-brand-black placeholder:text-brand-black/40 focus:outline-none focus:border-brand-black rounded"
        />
        <button
          type="submit"
          className="bg-brand-red text-white font-body text-xs uppercase tracking-widest px-6 py-3 hover:bg-brand-red/80 transition-colors rounded"
        >
          Track
        </button>
      </form>

      {/* Result Section */}
      {searched && (
        <>
          {orderResult ? (
            <div className="border border-brand-black/10 rounded-lg p-6 sm:p-8 bg-white shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-brand-black/10">
                <div>
                  <span className="text-xs font-body text-brand-black/40 uppercase tracking-widest">Order ID</span>
                  <h2 className="font-mono text-xl font-bold text-brand-black">#{orderResult.id.slice(-8).toUpperCase()}</h2>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-body text-brand-black/40 uppercase tracking-widest">Date Placed</span>
                  <p className="text-sm font-body text-brand-black">{new Date(orderResult.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h3 className="font-headline text-base uppercase tracking-widest text-brand-black mb-6">Fulfillment Progress</h3>
                <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-black/10">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusIndex = STATUS_STEPS.findIndex((s) => s.key === orderResult?.status)
                    const isCompleted = idx <= statusIndex
                    const isCurrent = idx === statusIndex

                    return (
                      <div key={step.key} className="relative flex items-start gap-4 pl-8">
                        <div
                          className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isCurrent
                              ? 'bg-brand-red text-white ring-4 ring-brand-red/20'
                              : isCompleted
                              ? 'bg-brand-black text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div>
                          <p className={`font-body text-sm font-semibold uppercase tracking-wider ${isCurrent ? 'text-brand-red' : 'text-brand-black'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs font-body text-brand-black/60 mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* MoMo Payment Alert if Pending */}
              {orderResult.status === 'pending_payment' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 text-sm font-body text-amber-900">
                  <p className="font-bold uppercase tracking-wider text-amber-950 mb-1">💡 Action Required: MoMo Payment</p>
                  <p>
                    Please transfer <strong>{formatPrice(orderResult.total)}</strong> to MoMo Number <strong className="font-mono">0557786833</strong> (ISAAC OKYERE) using reference <strong className="font-mono">#{orderResult.id.slice(-8).toUpperCase()}</strong>.
                  </p>
                </div>
              )}

              {/* Order Summary Details */}
              <div className="border-t border-brand-black/10 pt-6 space-y-4">
                <h3 className="font-headline text-base uppercase tracking-widest text-brand-black">Items Summary</h3>
                <div className="space-y-3 text-sm font-body">
                  {orderResult.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-brand-black/80">
                        {item.variant.product.name} ({item.variant.size} / {item.variant.color}) × {item.quantity}
                      </span>
                      <span className="font-semibold text-brand-black">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-brand-black/10">
                  <span>Total Amount</span>
                  <span className="text-brand-red">{formatPrice(orderResult.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-brand-black/10 rounded-lg bg-brand-black/5">
              <p className="font-body text-brand-black/70">No order found matching &quot;{searchQuery}&quot;.</p>
              <p className="text-xs font-body text-brand-black/40 mt-1">Please double check your Order ID or phone number and try again.</p>
            </div>
          )}
        </>
      )}

      <div className="mt-12 text-center">
        <Link href="/shop" className="text-xs font-body uppercase tracking-widest text-brand-red hover:underline">
          ← Back to Shop
        </Link>
      </div>
    </div>
  )
}
