import type { DeliveryStatus } from '@prisma/client'
import { STATUS_LABELS } from '@/lib/delivery'

const STYLES: Record<DeliveryStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  on_the_way: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700',
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-body font-semibold uppercase tracking-wider ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
