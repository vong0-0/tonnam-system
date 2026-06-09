import type { OrderWithItems } from '@/types/entities'

/**
 * Sums item.quantity across all orders in a bill.
 * Cancelled items are excluded by default.
 */
export function countBillItemQuantity(
  orders: OrderWithItems[],
  includeCancelled = false,
): number {
  return orders.reduce(
    (total, order) =>
      total +
      order.items.reduce((sum, item) => {
        if (!includeCancelled && item.status === 'CANCELLED') return sum
        return sum + item.quantity
      }, 0),
    0,
  )
}
