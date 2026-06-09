import type { Role } from '@/constants/roles'
import type {
  TableStatus,
  BillStatus,
  OrderStatus,
  OrderItemStatus,
  ReservationStatus,
  PaymentMethod,
} from '@/types/enums'

export interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  name: string
  description: string | null
  item_count: number
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_sold_out: boolean
  created_at: string
  updated_at: string
}

export interface Table {
  _id: string
  table_name: string
  capacity: number
  status: TableStatus
  is_temporary: boolean
  merge_group_id: string | null
  bill_ids: string[] | null
  created_at: string
  updated_at: string
}

export interface TableMergeGroup {
  id: string
  table_ids: string[]
  created_by: string
  created_at: string
}

export interface TableWithMergeGroup extends Table {
  merge_group: TableMergeGroup | null
}

export interface Reservation {
  id: string
  table_id: string
  reserver_name: string
  phone: string
  party_size: number
  reserved_at: string
  status: ReservationStatus
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  name: string
  unit_price: number
  quantity: number
  notes: string | null
  status: OrderItemStatus | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  short_id: string
  bill_id: string
  status: OrderStatus
  created_by: string
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  short_id: string
  name: string
  table_id: string
  parent_bill_id: string | null
  split_label: string | null
  status: BillStatus
  total_amount: number
  created_by: string
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

interface CashDetail {
  amount: number
  received_amount: number
  change_amount: number
}

export interface Payment {
  id: string
  bill_id: string
  method: PaymentMethod
  amount: number
  cash: CashDetail | null
  qr_promptpay: CashDetail | null
  confirmed_by: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor: { id: string; username: string; role: string }
  action: string
  entity_name: 'Bill' | 'Order' | 'OrderItem' | 'Table' | 'TableMergeGroup' | 'Payment'
  entity_id: string
  reason: string
  before_state: Record<string, unknown> | null
  after_state: Record<string, unknown> | null
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface BillTable {
  id: string
  table_name: string
  status: TableStatus
}

export interface BillDetail extends Bill {
  table: BillTable
  orders: OrderWithItems[]
  payments: Payment[]
}

export interface AuthUser {
  id: string
  username: string
  first_name: string
  last_name: string
  role: Role
}
