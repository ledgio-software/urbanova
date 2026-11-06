import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { siteConfig } from '@/lib/site-config'
import { NewDeliveryForm } from '@/components/admin/NewDeliveryForm'

export const dynamic = 'force-dynamic'

export default async function NewDeliveryPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams
  const riders = await prisma.rider.findMany({ where: { status: 'active' }, select: { id: true, name: true }, orderBy: { name: 'asc' } })

  let order = null
  if (orderId) {
    const o = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } })
    if (!o) notFound()
    order = {
      id: o.id,
      label: `#${o.id.slice(-8).toUpperCase()}`,
      dropoffName: o.customer?.name ?? 'Customer',
      dropoffAddress: o.deliveryAddress,
      fee: formatPrice(o.deliveryFee),
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href={order ? `/admin/orders/${order.id}` : '/admin/deliveries'} className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">
          ← {order ? 'Order' : 'Deliveries'}
        </Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">
          {order ? 'Send with URBANOVA Delivery' : 'New delivery booking'}
        </h1>
      </div>
      {riders.length === 0 && (
        <p className="border border-amber-300 bg-amber-50 p-3 font-body text-sm text-amber-900">
          No active riders yet — you can create the delivery now and assign it after adding a rider under <Link href="/admin/riders" className="underline">Riders</Link>.
        </p>
      )}
      <NewDeliveryForm riders={riders} order={order} defaultPickupAddress={order ? siteConfig.storePickupAddress ?? '' : ''} />
    </div>
  )
}
