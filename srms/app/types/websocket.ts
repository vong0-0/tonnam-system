import type {
  TableStatus,
  BillStatus,
  OrderStatus,
  OrderItemStatus,
  PaymentMethod,
} from '@/types/enums'
import type { Bill, Order, OrderItem, Reservation } from '@/types/entities'

export interface WsMessage<T = unknown> {
  event:     string
  channel:   string
  data:      T
  timestamp: string
}

export interface WsTableCreatedPayload {
  table_id: string
}

export interface WsTableUpdatedPayload {
  table_id: string
}

export interface WsTableDeletedPayload {
  table_id: string
}

export interface WsTableStatusUpdatedPayload {
  table_id: string
  status:   TableStatus
}

export interface WsTableMergedPayload {
  merge_group_id: string
  table_ids:      string[]
}

export interface WsTableUnmergedPayload {
  merge_group_id: string
  table_ids:      string[]
}

export interface WsTableMovedPayload {
  from_table_id: string
  to_table_id:   string
  bill_ids:      string[]
}

export interface WsBillCreatedPayload {
  bill: Bill
}

export interface WsBillStatusUpdatedPayload {
  bill_id:   string
  status:    BillStatus
  table_id?: string
}

export interface WsBillUpdatedPayload {
  bill: Bill
}

export interface WsBillPaymentConfirmedPayload {
  bill_id:    string
  payment_id: string
  method:     PaymentMethod
  amount:     number
}

export interface WsOrderNewOrderReceivedPayload {
  order: Order
  items: OrderItem[]
}

export interface WsOrderItemStatusUpdatedPayload {
  order_id: string
  item_id:  string
  status:   OrderItemStatus
}

export interface WsOrderStatusUpdatedPayload {
  order_id: string
  status:   OrderStatus
}

export interface WsMenuItemAvailabilityUpdatedPayload {
  item_id:      string
  is_available: boolean
  is_sold_out:  boolean
}

export interface WsSystemTokenExpiredPayload {
  message: string
}

export interface WsSystemForceLogoutPayload {
  message: string
}

export type WsPayloadMap = {
  'table:created':                  WsTableCreatedPayload
  'table:updated':                  WsTableUpdatedPayload
  'table:deleted':                  WsTableDeletedPayload
  'table:status_updated':           WsTableStatusUpdatedPayload
  'table:merged':                   WsTableMergedPayload
  'table:unmerged':                 WsTableUnmergedPayload
  'table:moved':                    WsTableMovedPayload
  'bill:created':                   WsBillCreatedPayload
  'bill:status_updated':            WsBillStatusUpdatedPayload
  'bill:updated':                   WsBillUpdatedPayload
  'bill:payment_confirmed':         WsBillPaymentConfirmedPayload
  'order:new_order_received':       WsOrderNewOrderReceivedPayload
  'order:item_status_updated':      WsOrderItemStatusUpdatedPayload
  'order:status_updated':           WsOrderStatusUpdatedPayload
  'menu:item_availability_updated': WsMenuItemAvailabilityUpdatedPayload
  'reservation:created':            WsReservationPayload
  'reservation:updated':            WsReservationPayload
  'reservation:status_updated':     WsReservationPayload
  'reservation:deleted':            WsReservationPayload
  'system:token_expired':           WsSystemTokenExpiredPayload
  'system:force_logout':            WsSystemForceLogoutPayload
}

export interface WsReservationPayload {
  reservation: Reservation
}
