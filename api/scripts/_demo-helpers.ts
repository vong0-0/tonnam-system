/**
 * Shared helpers for the demo seed + clear scripts.
 *
 * Every demo document is stamped with `__seed: 'DEMO'` (inserted via the raw
 * driver, bypassing Mongoose strict mode). That marker is invisible to the app
 * and analytics, and lets the clear script remove demo data unambiguously
 * without touching the user's real/test data.
 */
import { BillModel } from '@/models/bill.model.js'
import { OrderModel } from '@/models/order.model.js'
import { OrderItemModel } from '@/models/order-item.model.js'
import { PaymentModel } from '@/models/payment.model.js'
import { ReservationModel } from '@/models/reservation.model.js'
import { AuditLogModel } from '@/models/audit-log.model.js'
import { TableMergeGroupModel } from '@/models/table-merge-group.model.js'
import { TableModel } from '@/models/table.model.js'

export const DEMO_TAG = 'DEMO'

export interface ClearResult {
  bills: number
  orders: number
  orderItems: number
  payments: number
  reservations: number
  auditLogs: number
  mergeGroups: number
  tablesReset: number
}

/**
 * Delete all demo-tagged documents and reset (not delete) demo tables.
 * Tables, users, menu items and menu categories are kept.
 */
export async function clearDemoData(): Promise<ClearResult> {
  const tag = { __seed: DEMO_TAG }

  const [bills, orders, orderItems, payments, reservations, auditLogs, mergeGroups] =
    await Promise.all([
      BillModel.collection.deleteMany(tag),
      OrderModel.collection.deleteMany(tag),
      OrderItemModel.collection.deleteMany(tag),
      PaymentModel.collection.deleteMany(tag),
      ReservationModel.collection.deleteMany(tag),
      AuditLogModel.collection.deleteMany(tag),
      TableMergeGroupModel.collection.deleteMany(tag),
    ])

  // Keep demo tables but reset their transient state.
  const tablesReset = await TableModel.collection.updateMany(tag, {
    $set: { status: 'AVAILABLE', bill_ids: [], merge_group_id: null },
  })

  return {
    bills: bills.deletedCount,
    orders: orders.deletedCount,
    orderItems: orderItems.deletedCount,
    payments: payments.deletedCount,
    reservations: reservations.deletedCount,
    auditLogs: auditLogs.deletedCount,
    mergeGroups: mergeGroups.deletedCount,
    tablesReset: tablesReset.modifiedCount,
  }
}
