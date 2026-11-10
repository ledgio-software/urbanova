import type { OrderStatus } from '@prisma/client'

// What a stockist can do with an order they were paid for directly (Reference I.6).
export const STOCKIST_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['packed', 'shipped', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  returned: [],
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Waiting for payment',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'Sent',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'I’ve received the payment',
  packed: 'Mark packed',
  shipped: 'Mark sent',
  delivered: 'Mark delivered',
  cancelled: 'Cancel order',
}
