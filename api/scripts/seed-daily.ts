/**
 * Seed daily sales data for the analytics dashboard.
 * Run with: npm run seed:daily
 *
 * Idempotent — safe to run multiple times. If seed bills already exist for
 * today the script exits without inserting anything.
 */
import mongoose, { type Types } from 'mongoose'
import bcrypt from 'bcrypt'
import { BillModel } from '@/models/bill.model.js'
import { OrderModel } from '@/models/order.model.js'
import { OrderItemModel } from '@/models/order-item.model.js'
import { MenuCategoryModel } from '@/models/menu-category.model.js'
import { MenuItemModel } from '@/models/menu-item.model.js'
import { UserModel } from '@/models/user.model.js'
import { TableModel } from '@/models/table.model.js'
import { PaymentModel } from '@/models/payment.model.js'
import { BillStatus, OrderStatus, PaymentMethod } from '@/types/index.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function utcToday(h = 0, m = 0, s = 0): Date {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), h, m, s))
}

function todayStr(): string {
  const n = new Date()
  const y = n.getUTCFullYear()
  const mo = String(n.getUTCMonth() + 1).padStart(2, '0')
  const d = String(n.getUTCDate()).padStart(2, '0')
  return `${y}-${mo}-${d}`
}

// ─── Static seed data ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'ອາຫານຫຼັກ',  description: 'ອາຫານຈານຫຼັກ' },
  { name: 'ອາຫານຫວ່າງ', description: 'ອາຫານຫວ່າງ ແລະ ສາລາດ' },
  { name: 'ເຄື່ອງດື່ມ',  description: 'ນ້ຳດື່ມ ແລະ ເຄື່ອງດື່ມ' },
  { name: 'ຂອງຫວານ',    description: 'ຂອງຫວານ ແລະ ໄອສ ກີລ' },
]

const MENU_ITEMS = [
  // Mains — idx 0-2
  { catIdx: 0, name: 'ຂ້າວໜຽວ ໄກ່ ຢ່າງ', price: 45_000 },
  { catIdx: 0, name: 'ຕົ້ມຍຳ ກຸ້ງ',        price: 65_000 },
  { catIdx: 0, name: 'ຜັດຜັກ ໝູ',          price: 50_000 },
  // Appetizers — idx 3-5
  { catIdx: 1, name: 'ຕຳໝາກຫຸ່ງ',          price: 35_000 },
  { catIdx: 1, name: 'ປີ້ງໄກ່',              price: 40_000 },
  { catIdx: 1, name: 'ໄສ້ກອກ ລາວ',          price: 45_000 },
  // Drinks — idx 6-8
  { catIdx: 2, name: 'ນ້ຳໝາກນາວ ສົດ',       price: 20_000 },
  { catIdx: 2, name: 'ນ້ຳດື່ມ',              price: 10_000 },
  { catIdx: 2, name: 'ຊາ ເຢັນ',              price: 25_000 },
  // Desserts — idx 9-11
  { catIdx: 3, name: 'ເຂົ້ານຽວ ມະມ່ວງ',     price: 45_000 },
  { catIdx: 3, name: 'ໂຕໂຟ ຊຸບ',            price: 30_000 },
  { catIdx: 3, name: 'ໄອສ ກີລ',             price: 35_000 },
]

const TABLE_NAMES = ['ໂຕະ 1', 'ໂຕะ 2', 'ໂຕະ 3', 'ໂຕะ 4']

type ItemSpec   = { idx: number; qty: number }
type OrderSpec  = { items: ItemSpec[] }
type BillSpec   = { tableIdx: number; hourUtc: number; minUtc: number; orders: OrderSpec[]; payment: PaymentMethod }

// 12 bills: 4 lunch (UTC 04–07 = local 11–14) + 8 dinner (UTC 11–16 = local 18–23)
const BILL_SPECS: BillSpec[] = [
  { tableIdx: 0, hourUtc: 4,  minUtc: 15, payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 0, qty: 2 }, { idx: 3, qty: 1 }, { idx: 6, qty: 2 }] }] },

  { tableIdx: 1, hourUtc: 5,  minUtc: 0,  payment: PaymentMethod.QR_PROMPTPAY,
    orders: [{ items: [{ idx: 1, qty: 1 }, { idx: 4, qty: 1 }, { idx: 7, qty: 2 }] }] },

  { tableIdx: 2, hourUtc: 5,  minUtc: 45, payment: PaymentMethod.CASH,
    orders: [
      { items: [{ idx: 2, qty: 1 }, { idx: 5, qty: 1 }] },
      { items: [{ idx: 8, qty: 2 }, { idx: 11, qty: 1 }] },
    ] },

  { tableIdx: 3, hourUtc: 6,  minUtc: 30, payment: PaymentMethod.QR_PROMPTPAY,
    orders: [{ items: [{ idx: 0, qty: 1 }, { idx: 1, qty: 1 }, { idx: 6, qty: 1 }] }] },

  { tableIdx: 0, hourUtc: 11, minUtc: 0,  payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 2, qty: 2 }, { idx: 3, qty: 1 }, { idx: 7, qty: 3 }] }] },

  { tableIdx: 1, hourUtc: 11, minUtc: 45, payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 1, qty: 2 }, { idx: 4, qty: 2 }, { idx: 8, qty: 2 }] }] },

  { tableIdx: 2, hourUtc: 12, minUtc: 30, payment: PaymentMethod.QR_PROMPTPAY,
    orders: [{ items: [{ idx: 0, qty: 2 }, { idx: 5, qty: 1 }, { idx: 9, qty: 2 }] }] },

  { tableIdx: 3, hourUtc: 13, minUtc: 0,  payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 2, qty: 1 }, { idx: 3, qty: 2 }, { idx: 6, qty: 3 }] }] },

  { tableIdx: 0, hourUtc: 13, minUtc: 30, payment: PaymentMethod.QR_PROMPTPAY,
    orders: [
      { items: [{ idx: 1, qty: 1 }, { idx: 4, qty: 1 }, { idx: 10, qty: 2 }] },
      { items: [{ idx: 8, qty: 2 }] },
    ] },

  { tableIdx: 1, hourUtc: 14, minUtc: 0,  payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 0, qty: 3 }, { idx: 5, qty: 2 }, { idx: 7, qty: 2 }] }] },

  { tableIdx: 2, hourUtc: 14, minUtc: 45, payment: PaymentMethod.CASH,
    orders: [{ items: [{ idx: 2, qty: 2 }, { idx: 4, qty: 1 }, { idx: 9, qty: 1 }] }] },

  { tableIdx: 3, hourUtc: 15, minUtc: 30, payment: PaymentMethod.QR_PROMPTPAY,
    orders: [{ items: [{ idx: 1, qty: 1 }, { idx: 3, qty: 1 }, { idx: 11, qty: 2 }, { idx: 8, qty: 1 }] }] },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const uri    = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'

  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB')

  // Idempotency guard — exit if seed bills already exist for today
  const dateStr  = todayStr()
  const dayStart = utcToday(0, 0, 0)
  const dayEnd   = utcToday(23, 59, 59)
  const existing = await BillModel.countDocuments({
    short_id: /^SEED-/,
    status: BillStatus.PAID,
    created_at: { $gte: dayStart, $lte: dayEnd },
  })
  if (existing > 0) {
    console.log(`ℹ ${existing} seed bills already exist for ${dateStr} — skipping`)
    await mongoose.disconnect()
    return
  }

  // ── Upsert prerequisites ──────────────────────────────────────────────────

  const hashedPw = await bcrypt.hash('Seed@1234', 10)
  const user = await UserModel.findOneAndUpdate(
    { username: 'seed_admin' },
    {
      $setOnInsert: {
        username:   'seed_admin',
        first_name: 'Seed',
        last_name:  'Admin',
        phone:      '+8562000000000',
        password:   hashedPw,
        role:       'ADMIN' as const,
        is_active:  true,
      },
    },
    { upsert: true, returnDocument: 'after' },
  )

  const tableIds: Types.ObjectId[] = []
  for (const name of TABLE_NAMES) {
    const t = await TableModel.findOneAndUpdate(
      { table_name: name },
      { $setOnInsert: { table_name: name, capacity: 4, status: 'AVAILABLE' as const, is_temporary: false, merge_group_id: null, bill_ids: [] } },
      { upsert: true, returnDocument: 'after' },
    )
    tableIds.push(t!._id as Types.ObjectId)
  }

  const categoryIds: Types.ObjectId[] = []
  for (const cat of CATEGORIES) {
    const c = await MenuCategoryModel.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, returnDocument: 'after' },
    )
    categoryIds.push(c!._id as Types.ObjectId)
  }

  const menuItems: Array<{ _id: Types.ObjectId; name: string; price: number }> = []
  for (const item of MENU_ITEMS) {
    const catId = categoryIds[item.catIdx]!
    const m = await MenuItemModel.findOneAndUpdate(
      { name: item.name },
      { $setOnInsert: { name: item.name, category_id: catId, price: item.price, is_available: true, is_sold_out: false, description: null, image_url: null } },
      { upsert: true, returnDocument: 'after' },
    )
    menuItems.push({ _id: m!._id as Types.ObjectId, name: m!.name, price: m!.price })
  }

  console.log(`✓ Prerequisites ready (1 user, ${tableIds.length} tables, ${categoryIds.length} categories, ${menuItems.length} items)`)

  // ── Build documents ───────────────────────────────────────────────────────

  const userId = user!._id as Types.ObjectId

  type RawDoc = Record<string, unknown>
  const billDocs:      RawDoc[] = []
  const orderDocs:     RawDoc[] = []
  const orderItemDocs: RawDoc[] = []
  const paymentDocs:   RawDoc[] = []

  let totalRevenue = 0

  for (let i = 0; i < BILL_SPECS.length; i++) {
    const spec    = BILL_SPECS[i]!
    const billId  = new mongoose.Types.ObjectId()
    const billAt  = utcToday(spec.hourUtc, spec.minUtc)
    const tableId = tableIds[spec.tableIdx]!
    const shortId = `SEED-${String(i + 1).padStart(3, '0')}`

    // Calculate total_amount
    let billTotal = 0
    for (const ord of spec.orders) {
      for (const it of ord.items) {
        billTotal += menuItems[it.idx]!.price * it.qty
      }
    }
    totalRevenue += billTotal

    billDocs.push({
      _id:            billId,
      short_id:       shortId,
      name:           TABLE_NAMES[spec.tableIdx],
      table_id:       tableId,
      parent_bill_id: null,
      split_label:    null,
      status:         BillStatus.PAID,
      total_amount:   billTotal,
      created_by:     userId,
      cancel_reason:  null,
      created_at:     billAt,
      updated_at:     billAt,
    })

    for (let oi = 0; oi < spec.orders.length; oi++) {
      const ordSpec  = spec.orders[oi]!
      const orderId  = new mongoose.Types.ObjectId()
      const orderAt  = new Date(billAt.getTime() + (oi + 1) * 2 * 60_000)

      orderDocs.push({
        _id:           orderId,
        short_id:      `${shortId}-O${oi + 1}`,
        bill_id:       billId,
        status:        OrderStatus.COOKED,
        created_by:    userId,
        cancel_reason: null,
        created_at:    orderAt,
        updated_at:    orderAt,
      })

      for (const it of ordSpec.items) {
        const mi = menuItems[it.idx]!
        orderItemDocs.push({
          _id:                    new mongoose.Types.ObjectId(),
          order_id:               orderId,
          menu_item_id:           mi._id,
          name:                   mi.name,
          quantity:               it.qty,
          unit_price:             mi.price,
          note:                   null,
          status:                 null,
          cancel_reason:          null,
          quantity_change_reason: null,
          created_at:             orderAt,
          updated_at:             orderAt,
        })
      }
    }

    // Payment (paid ~30 min after bill opened)
    const paidAt  = new Date(billAt.getTime() + 30 * 60_000)
    const isCash  = spec.payment === PaymentMethod.CASH
    paymentDocs.push({
      _id:          new mongoose.Types.ObjectId(),
      bill_id:      billId,
      method:       spec.payment,
      amount:       billTotal,
      cash:         isCash ? { amount: billTotal, received_amount: billTotal, change_amount: 0 } : null,
      qr_promptpay: isCash ? null : { amount: billTotal, received_amount: billTotal, change_amount: 0 },
      confirmed_by: userId,
      created_at:   paidAt,
    })
  }

  // ── Insert (collection.insertMany bypasses Mongoose timestamps) ───────────

  await BillModel.collection.insertMany(billDocs)
  await OrderModel.collection.insertMany(orderDocs)
  await OrderItemModel.collection.insertMany(orderItemDocs)
  await PaymentModel.collection.insertMany(paymentDocs)

  console.log(`✓ Created ${billDocs.length} bills for ${dateStr}`)
  console.log(`✓ Total revenue seeded: ₭${totalRevenue.toLocaleString()}`)
  console.log('✓ Done')

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})
