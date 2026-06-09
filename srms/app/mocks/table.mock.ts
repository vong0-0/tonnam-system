import { TableStatus, BillStatus, OrderStatus, OrderItemStatus, PaymentMethod } from '@/types/enums'
import type { Table, BillDetail } from '@/types/entities'

export const mockTables: Table[] = [
  {
    _id: 't-001',
    table_name: 'โต๊ะ 1',
    capacity: 4,
    status: TableStatus.AVAILABLE,
    is_temporary: false,
    merge_group_id: null,
    bill_ids: null,
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-01-01T08:00:00.000Z',
  },
  {
    _id: 't-002',
    table_name: 'โต๊ะ 2',
    capacity: 2,
    status: TableStatus.OCCUPIED,
    is_temporary: false,
    merge_group_id: null,
    bill_ids: ['b-001'],
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-06-09T10:15:00.000Z',
  },
  {
    _id: 't-003',
    table_name: 'โต๊ะ 3',
    capacity: 6,
    status: TableStatus.RESERVED,
    is_temporary: false,
    merge_group_id: null,
    bill_ids: null,
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-06-09T11:00:00.000Z',
  },
  {
    _id: 't-004',
    table_name: 'โต๊ะ 4',
    capacity: 4,
    status: TableStatus.PAID,
    is_temporary: false,
    merge_group_id: 'mg-001',
    bill_ids: ['b-002'],
    created_at: '2026-01-01T08:00:00.000Z',
    updated_at: '2026-06-09T12:30:00.000Z',
  },
  {
    _id: 't-005',
    table_name: 'โต๊ะพิเศษ',
    capacity: 10,
    status: TableStatus.AVAILABLE,
    is_temporary: true,
    merge_group_id: null,
    bill_ids: null,
    created_at: '2026-06-09T09:00:00.000Z',
    updated_at: '2026-06-09T09:00:00.000Z',
  },
]

// ─── Shared IDs ──────────────────────────────────────────────────────────────

const TABLE_ID = '65f3a2b8c1d2e3f4a5b6c705'
const BILL_ID = '65f3a2b8c1d2e3f4a5b6c70b'
const WAITER_ID = '65f3a2b8c1d2e3f4a5b6c70c'
const CASHIER_ID = '65f3a2b8c1d2e3f4a5b6c70d'
const ORDER1_ID = '65f3a2b8c1d2e3f4a5b6c711'
const ORDER2_ID = '65f3a2b8c1d2e3f4a5b6c712'

// ─── mockTable ───────────────────────────────────────────────────────────────

export const mockTable: Table = {
  _id: TABLE_ID,
  table_name: 'โต๊ะ 5',
  capacity: 4,
  status: TableStatus.OCCUPIED,
  is_temporary: false,
  merge_group_id: null,
  bill_ids: [BILL_ID],
  created_at: '2026-01-01T08:00:00.000Z',
  updated_at: '2026-06-09T18:30:00.000Z',
}

// ─── mockBillDetail ──────────────────────────────────────────────────────────
// total_amount: (120×2) + (180×1) + (20×2) + (60×2) + (80×1) = 660

export const mockBillDetail: BillDetail[] = [{
  id: BILL_ID,
  short_id: 'B-0042',
  name: 'บิลโต๊ะ 5',
  table_id: TABLE_ID,
  parent_bill_id: null,
  split_label: null,
  status: BillStatus.OPEN,
  total_amount: 660,
  created_by: CASHIER_ID,
  cancel_reason: null,
  created_at: '2026-06-09T18:30:00.000Z',
  updated_at: '2026-06-09T19:05:00.000Z',

  table: {
    id: TABLE_ID,
    table_name: 'โต๊ะ 5',
    status: TableStatus.OCCUPIED,
  },

  orders: [
    {
      // round 1 — all items cooked
      id: ORDER1_ID,
      short_id: 'O-0117',
      bill_id: BILL_ID,
      status: OrderStatus.COOKED,
      created_by: WAITER_ID,
      cancel_reason: null,
      created_at: '2026-06-09T18:32:00.000Z',
      updated_at: '2026-06-09T18:50:00.000Z',
      items: [
        {
          id: '65f3a2b8c1d2e3f4a5b6c721',
          order_id: ORDER1_ID,
          menu_item_id: '65f3a2b8c1d2e3f4a5b6c731',
          name: 'ผัดไทยกุ้งสด',
          unit_price: 120,
          quantity: 2,
          notes: null,
          status: OrderItemStatus.COOKED,
          cancel_reason: null,
          created_at: '2026-06-09T18:32:00.000Z',
          updated_at: '2026-06-09T18:50:00.000Z',
        },
        {
          id: '65f3a2b8c1d2e3f4a5b6c722',
          order_id: ORDER1_ID,
          menu_item_id: '65f3a2b8c1d2e3f4a5b6c732',
          name: 'ต้มยำกุ้งน้ำข้น',
          unit_price: 180,
          quantity: 1,
          notes: 'เผ็ดน้อย',
          status: OrderItemStatus.COOKED,
          cancel_reason: null,
          created_at: '2026-06-09T18:32:00.000Z',
          updated_at: '2026-06-09T18:50:00.000Z',
        },
        {
          id: '65f3a2b8c1d2e3f4a5b6c723',
          order_id: ORDER1_ID,
          menu_item_id: '65f3a2b8c1d2e3f4a5b6c733',
          name: 'ข้าวสวย',
          unit_price: 20,
          quantity: 2,
          notes: null,
          status: OrderItemStatus.COOKED,
          cancel_reason: null,
          created_at: '2026-06-09T18:32:00.000Z',
          updated_at: '2026-06-09T18:50:00.000Z',
        },
      ],
    },
    {
      // round 2 — items still pending in kitchen
      id: ORDER2_ID,
      short_id: 'O-0118',
      bill_id: BILL_ID,
      status: OrderStatus.SENT_TO_KITCHEN,
      created_by: WAITER_ID,
      cancel_reason: null,
      created_at: '2026-06-09T19:05:00.000Z',
      updated_at: '2026-06-09T19:05:00.000Z',
      items: [
        {
          id: '65f3a2b8c1d2e3f4a5b6c724',
          order_id: ORDER2_ID,
          menu_item_id: '65f3a2b8c1d2e3f4a5b6c734',
          name: 'น้ำมะนาวโซดา',
          unit_price: 60,
          quantity: 2,
          notes: null,
          status: null,
          cancel_reason: null,
          created_at: '2026-06-09T19:05:00.000Z',
          updated_at: '2026-06-09T19:05:00.000Z',
        },
        {
          id: '65f3a2b8c1d2e3f4a5b6c725',
          order_id: ORDER2_ID,
          menu_item_id: '65f3a2b8c1d2e3f4a5b6c735',
          name: 'ไอศกรีมกะทิ',
          unit_price: 80,
          quantity: 1,
          notes: 'ไม่เอาถั่ว',
          status: null,
          cancel_reason: null,
          created_at: '2026-06-09T19:05:00.000Z',
          updated_at: '2026-06-09T19:05:00.000Z',
        },
      ],
    },
  ],

  payments: [],
}]
