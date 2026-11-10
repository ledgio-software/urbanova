import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { optionLabel } from '@/lib/market'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { ACTION_LABEL, STATUS_LABEL, STOCKIST_NEXT } from '@/lib/stockist-orders'
import { OrderStatusActions } from '@/components/partner/OrderStatusActions'
import { whatsappUrlFor } from '@/lib/phone'

export const dynamic = 'force-dynamic'

export default async function StockistOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { partner } = await requirePartnerPage()
  if (partner.type !== 'stockist') redirect('/partner')
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      items: { include: { variant: { select: { size: true, color: true, product: { select: { name: true } } } } } },
    },
  })
  if (!order || order.sellerPartnerId !== partner.id) notFound()

  const shortId = order.id.slice(-8).toUpperCase()
  const actions = STOCKIST_NEXT[order.status].map((s) => ({ status: s, label: ACTION_LABEL[s] ?? STATUS_LABEL[s] }))
  const phone = order.customer?.phone ?? ''
  const wa = whatsappUrlFor(phone)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/partner/orders" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← Orders</Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">Order #{shortId}</h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          {order.createdAt.toISOString().slice(0, 16).replace('T', ' ')} · <span data-testid="order-status">{STATUS_LABEL[order.status]}</span>
        </p>
      </div>

      {order.status === 'pending_payment' && (
        <p className="border border-amber-300 bg-amber-50 p-3 font-body text-sm text-amber-900">
          The customer was asked to send <strong>{formatPrice(order.total)}</strong> to your account with reference <strong>#{shortId}</strong>.
          Only confirm once the money is in your account.
        </p>
      )}
      <OrderStatusActions orderId={order.id} actions={actions} />

      <section className="border border-gray-200 bg-white p-5 font-body text-sm">
        <h2 className="mb-3 font-headline text-lg uppercase tracking-widest text-brand-black">Items</h2>
        <ul className="divide-y divide-gray-100">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>
                {i.variant.product.name} <span className="text-gray-500">· {optionLabel(i.variant)} × {i.quantity}</span>
              </span>
              <span>{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          <p className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
          <p className="flex justify-between text-gray-600"><span>Delivery ({order.deliveryZone})</span><span>{formatPrice(order.deliveryFee)}</span></p>
          <p className="flex justify-between font-semibold text-brand-black"><span>Total</span><span>{formatPrice(order.total)}</span></p>
        </div>
      </section>

      <section className="border border-gray-200 bg-white p-5 font-body text-sm">
        <h2 className="mb-3 font-headline text-lg uppercase tracking-widest text-brand-black">Customer</h2>
        <p className="font-semibold text-brand-black">{order.customer?.name}</p>
        <p className="mt-1 whitespace-pre-wrap text-gray-700">{order.deliveryAddress}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {phone && (
            <a href={`tel:${phone}`} className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">Call {phone}</a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">WhatsApp</a>
          )}
          {order.customer?.email && (
            <a href={`mailto:${order.customer.email}`} className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">Email</a>
          )}
        </div>
      </section>
    </div>
  )
}
