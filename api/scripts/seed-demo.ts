/**
 * Comprehensive demo seed for the thesis presentation.
 * Run with: npm run seed:demo               (writes to the dev DB)
 *           npm run seed:demo -- --dry-run   (print plan + period windows, no writes)
 * Remove with: npm run seed:demo:clear
 *
 * Seeds EVERY module except user / menu-item / menu-category (those are reused):
 * tables, bills, orders, order items, payments, reservations, audit logs and a
 * table-merge group. Sales bills run continuously from Jan 1 of last year up to
 * TODAY (never the future) with an upward per-day trend, so the Analytics
 * dashboard shows realistic, growing numbers for daily / weekly / monthly /
 * yearly. Every document is stamped `__seed: 'DEMO'` for clean removal.
 *
 * All human-facing text is in Lao.
 */
import mongoose, { type Types } from 'mongoose'
import { BillModel } from '@/models/bill.model.js'
import { OrderModel } from '@/models/order.model.js'
import { OrderItemModel } from '@/models/order-item.model.js'
import { PaymentModel } from '@/models/payment.model.js'
import { ReservationModel } from '@/models/reservation.model.js'
import { AuditLogModel } from '@/models/audit-log.model.js'
import { TableMergeGroupModel } from '@/models/table-merge-group.model.js'
import { TableModel } from '@/models/table.model.js'
import { UserModel } from '@/models/user.model.js'
import { MenuItemModel } from '@/models/menu-item.model.js'
import { BillStatus, OrderStatus, OrderItemStatus, PaymentMethod } from '@/types/index.js'
import { DEMO_TAG, clearDemoData } from './_demo-helpers.js'

type RawDoc = Record<string, unknown>
type MenuRef = { id: Types.ObjectId; name: string; price: number }

// ─── Lao text pools ─────────────────────────────────────────────────────────
const ITEM_NOTES = ['ບໍ່ເຜັດ', 'ເຜັດໜ້ອຍ', 'ບໍ່ໃສ່ຜັກຊີ', 'ໃສ່ນ້ຳກ້ອນແຍກ', 'ເອົາໄວ', 'ບໍ່ໃສ່ຜົງຊູລົດ']
const RESERVER_NAMES = [
  'ສົມໃຈ', 'ບຸນມີ', 'ຄຳແພງ', 'ວົງສະຫວັນ', 'ນາງ ດາວ', 'ທ້າວ ສຸກ', 'ພອນ', 'ມະນີ',
  'ສີດາ', 'ຄຳຫລ້າ', 'ບົວ', 'ໄຊ', 'ຈັນທະ', 'ອຳພອນ', 'ເພັດ', 'ໂພທິ',
]
const RESERVE_NOTES = ['ຂໍໂຕະຕິດໜ້າຕ່າງ', 'ມາເປັນຄອບຄົວ', 'ມີເດັກນ້ອຍ', 'ງານວັນເກີດ', null, null, null]
const CANCEL_REASONS = ['ລູກຄ້າຍົກເລີກ', 'ສັ່ງຜິດ', 'ລູກຄ້າບໍ່ມາ']
const AUDIT_REASONS = ['ສ້າງບິນໃໝ່', 'ແກ້ໄຂຈຳນວນອາຫານ', 'ລູກຄ້າຍົກເລີກ', 'ຢືນຢັນການຊຳລະ', 'ຍ້າຍໂຕະ']

// ─── RNG helpers ────────────────────────────────────────────────────────────
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

// ─── UTC date helpers ───────────────────────────────────────────────────────
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000)
}
function atTime(day: Date, hour: number, minute: number): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute))
}

// Restaurant local timezone (Asia/Vientiane = UTC+7). The analytics daily chart
// buckets bills by LOCAL hour (new Date(created_at).getHours()), and the frontend
// shows timestamps in local time — both run on the UTC+7 demo machine. So store a
// bill meant for `localHour` at the UTC instant `localHour - TZ_OFFSET`.
// (Change to 0 if the API server ever runs in UTC.)
const TZ_OFFSET = 7
function atLocal(day: Date, localHour: number, minute: number): Date {
  return atTime(day, localHour - TZ_OFFSET, minute)
}

// Evening-only service hours (restaurant opens 16:00–21:00 local). Weighted curve
// peaking around dinner, light tails at 15:00 and 22:00–23:00 → the daily chart
// shows bars only from ~15:00 onward, nothing in the morning/midday.
const SERVICE_HOURS_LOCAL = [15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 22, 23]

/** Mirror of the backend analytics getDateRange() — for the dry-run window print. */
function getDateRange(period: 'daily' | 'weekly' | 'monthly' | 'yearly', ref: Date) {
  const y = ref.getUTCFullYear()
  const m = ref.getUTCMonth()
  const d = ref.getUTCDate()
  if (period === 'daily') {
    return { start: new Date(Date.UTC(y, m, d)), end: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)) }
  }
  if (period === 'weekly') {
    const day = ref.getUTCDay()
    const offset = day === 0 ? -6 : 1 - day
    const start = new Date(Date.UTC(y, m, d + offset))
    return { start, end: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999)) }
  }
  if (period === 'monthly') {
    return { start: new Date(Date.UTC(y, m, 1)), end: new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999)) }
  }
  return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)) }
}

function buildPaymentBreakdown(
  total: number,
  method: PaymentMethod,
): { cash: RawDoc | null; qr_promptpay: RawDoc | null } {
  if (method === PaymentMethod.CASH) {
    const received = roundTo(total + randInt(0, 20) * 1000, 1000)
    return {
      cash: { amount: total, received_amount: received, change_amount: received - total },
      qr_promptpay: null,
    }
  }
  if (method === PaymentMethod.QR_PROMPTPAY) {
    return {
      cash: null,
      qr_promptpay: { amount: total, received_amount: total, change_amount: 0 },
    }
  }
  // MIXED: split into a cash part + qr part
  const cashPart = roundTo(total * (0.3 + Math.random() * 0.4), 1000)
  const qrPart = total - cashPart
  return {
    cash: { amount: cashPart, received_amount: cashPart, change_amount: 0 },
    qr_promptpay: { amount: qrPart, received_amount: qrPart, change_amount: 0 },
  }
}

function pickMethod(): PaymentMethod {
  const r = Math.random()
  if (r < 0.5) return PaymentMethod.CASH
  if (r < 0.85) return PaymentMethod.QR_PROMPTPAY
  return PaymentMethod.MIXED
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  const now = new Date()
  const today = utcMidnight(now)
  const thisYear = today.getUTCFullYear()
  const start = new Date(Date.UTC(thisYear - 1, 0, 1)) // Jan 1 of last year
  const totalDays = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1

  // Dry-run: print the period windows + planned volume, no DB.
  if (dryRun) {
    console.log('— DRY RUN — no database writes')
    console.log(`  date range: ${start.toISOString().slice(0, 10)} → ${today.toISOString().slice(0, 10)} (${totalDays} days)`)
    console.log(`  est. PAID bills: ~${Math.round(totalDays * 3.5)} (2–6 / day, upward trend)`)
    const periods = ['daily', 'weekly', 'monthly', 'yearly'] as const
    for (const p of periods) {
      const cur = getDateRange(p, today)
      const prevRef =
        p === 'daily' ? addDays(today, -1)
        : p === 'weekly' ? addDays(today, -7)
        : p === 'monthly' ? new Date(Date.UTC(thisYear, today.getUTCMonth() - 1, 15))
        : new Date(Date.UTC(thisYear - 1, today.getUTCMonth(), 15))
      const prev = getDateRange(p, prevRef)
      console.log(`  ${p.padEnd(8)} current ${cur.start.toISOString().slice(0, 10)}…${cur.end.toISOString().slice(0, 10)}  | previous ${prev.start.toISOString().slice(0, 10)}…${prev.end.toISOString().slice(0, 10)}`)
    }
    console.log('  note: current week/month/year are partial (no future data) — daily comparison is positive;')
    console.log('        pick a fully-elapsed period in the dashboard to show positive weekly/monthly/yearly growth.')
    return
  }

  const uri = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'
  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB')

  // Re-runnable: clear any previous demo data first.
  const cleared = await clearDemoData()
  console.log(`✓ Reset previous demo data (bills ${cleared.bills}, reservations ${cleared.reservations}, ...)`)

  // ── Prerequisites (reuse, do not seed) ──────────────────────────────────────
  const admin = await UserModel.findOne({ role: 'ADMIN' }).lean()
  if (!admin) throw new Error('No ADMIN user found. Create an admin user first.')
  const actorId = admin._id as Types.ObjectId
  const actor = { id: actorId, username: String(admin.username), role: String(admin.role) }

  const rawItems = await MenuItemModel.find({}, { name: 1, price: 1, category_id: 1 }).lean()
  if (rawItems.length === 0) throw new Error('No menu items found. Run `npm run seed:menu` first.')
  const items: MenuRef[] = rawItems.map((i) => ({
    id: i._id as Types.ObjectId,
    name: String(i.name),
    price: Number(i.price),
  }))

  // ── Tables: ໂຕະ 1 … ໂຕະ 15 (upsert, tagged, kept on clear) ─────────────────
  const TABLE_COUNT = 15
  const tableNames = Array.from({ length: TABLE_COUNT }, (_, i) => `ໂຕະ ${i + 1}`)
  for (const name of tableNames) {
    await TableModel.collection.updateOne(
      { table_name: name },
      {
        $set: {
          status: 'AVAILABLE',
          is_temporary: false,
          merge_group_id: null,
          bill_ids: [],
          __seed: DEMO_TAG,
          updatedAt: now,
        },
        $setOnInsert: { table_name: name, capacity: pick([2, 4, 4, 6]), createdAt: now },
      },
      { upsert: true },
    )
  }
  const tableDocs = await TableModel.find({ table_name: { $in: tableNames } }, { _id: 1, table_name: 1 }).lean()
  const tables = tableDocs.map((t) => ({ id: t._id as Types.ObjectId, name: String(t.table_name) }))

  // ── Sales backbone: continuous daily PAID bills (+ a few CANCELLED) ─────────
  const billDocs: RawDoc[] = []
  const orderDocs: RawDoc[] = []
  const orderItemDocs: RawDoc[] = []
  const paymentDocs: RawDoc[] = []
  const paidBillRefs: Array<{ id: Types.ObjectId; name: string; total: number; at: Date }> = []
  let billSeq = 0

  function makeBill(day: Date, status: BillStatus): { revenue: number } {
    billSeq += 1
    const table = pick(tables)
    const billId = new mongoose.Types.ObjectId()
    const at = atLocal(day, pick(SERVICE_HOURS_LOCAL), randInt(0, 59)) // evening service hours
    const cancelled = status === BillStatus.CANCELLED

    let billTotal = 0
    const orderCount = randInt(1, 2)
    for (let o = 0; o < orderCount; o++) {
      const orderId = new mongoose.Types.ObjectId()
      const orderAt = new Date(at.getTime() + o * 3 * 60_000)
      orderDocs.push({
        _id: orderId,
        short_id: `DEMO-${billSeq}-O${o + 1}`,
        bill_id: billId,
        status: cancelled ? OrderStatus.CANCELLED : OrderStatus.COOKED,
        created_by: actorId,
        cancel_reason: cancelled ? pick(CANCEL_REASONS) : null,
        created_at: orderAt,
        updated_at: orderAt,
        __seed: DEMO_TAG,
      })
      const lineCount = randInt(1, 4)
      for (let li = 0; li < lineCount; li++) {
        const item = pick(items)
        const qty = randInt(1, 3)
        billTotal += item.price * qty
        orderItemDocs.push({
          _id: new mongoose.Types.ObjectId(),
          order_id: orderId,
          menu_item_id: item.id,
          name: item.name,
          quantity: qty,
          unit_price: item.price,
          note: Math.random() < 0.12 ? pick(ITEM_NOTES) : null,
          status: cancelled ? OrderItemStatus.CANCELLED : OrderItemStatus.COOKED,
          cancel_reason: null,
          quantity_change_reason: null,
          created_at: orderAt,
          updated_at: orderAt,
          __seed: DEMO_TAG,
        })
      }
    }

    billDocs.push({
      _id: billId,
      short_id: `DEMO-${billSeq}`,
      name: table.name,
      table_id: table.id,
      parent_bill_id: null,
      split_label: null,
      status,
      total_amount: billTotal,
      created_by: actorId,
      cancel_reason: cancelled ? pick(CANCEL_REASONS) : null,
      created_at: at,
      updated_at: at,
      __seed: DEMO_TAG,
    })

    if (!cancelled) {
      const method = pickMethod()
      const { cash, qr_promptpay } = buildPaymentBreakdown(billTotal, method)
      paymentDocs.push({
        _id: new mongoose.Types.ObjectId(),
        bill_id: billId,
        method,
        amount: billTotal,
        cash,
        qr_promptpay,
        confirmed_by: actorId,
        created_at: new Date(at.getTime() + 30 * 60_000),
        __seed: DEMO_TAG,
      })
      paidBillRefs.push({ id: billId, name: table.name, total: billTotal, at })
    }
    return { revenue: cancelled ? 0 : billTotal }
  }

  let prevDayRevenue = 0
  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    const day = addDays(start, dayIdx)
    const isToday = dayIdx === totalDays - 1
    const progress = dayIdx / totalDays
    const dow = day.getUTCDay()
    const weekendBonus = dow === 5 || dow === 6 ? 1 : dow === 0 ? 0.5 : 0
    // Upward trend: more bills/day as time advances → per-day average rises.
    let billsToday = clamp(Math.round(2 + 3 * progress + weekendBonus + (Math.random() - 0.5)), 2, 6)

    let dayRevenue = 0
    for (let b = 0; b < billsToday; b++) dayRevenue += makeBill(day, BillStatus.PAID).revenue
    // Occasional cancelled bill (realism + audit logs; not counted by analytics)
    if (Math.random() < 0.06) makeBill(day, BillStatus.CANCELLED)

    // Guarantee the daily comparison (today vs yesterday) is positive.
    if (isToday) {
      let guard = 0
      while (dayRevenue <= prevDayRevenue * 1.08 && guard < 8) {
        dayRevenue += makeBill(day, BillStatus.PAID).revenue
        billsToday += 1
        guard += 1
      }
    }
    prevDayRevenue = dayRevenue
  }

  // ── Current OPEN bills (live tables) — today, not counted by analytics ──────
  const openTables = tables.slice(0, 4)
  for (let i = 0; i < openTables.length; i++) {
    const t = openTables[i]!
    billSeq += 1
    const billId = new mongoose.Types.ObjectId()
    const at = atLocal(today, randInt(16, 22), randInt(0, 59)) // evening service hours
    const orderId = new mongoose.Types.ObjectId()
    let total = 0
    const lineCount = randInt(1, 3)
    for (let li = 0; li < lineCount; li++) {
      const item = pick(items)
      const qty = randInt(1, 2)
      total += item.price * qty
      orderItemDocs.push({
        _id: new mongoose.Types.ObjectId(), order_id: orderId, menu_item_id: item.id,
        name: item.name, quantity: qty, unit_price: item.price, note: null,
        status: null, cancel_reason: null, quantity_change_reason: null,
        created_at: at, updated_at: at, __seed: DEMO_TAG,
      })
    }
    orderDocs.push({
      _id: orderId, short_id: `DEMO-${billSeq}-O1`, bill_id: billId,
      status: OrderStatus.SENT_TO_KITCHEN, created_by: actorId, cancel_reason: null,
      created_at: at, updated_at: at, __seed: DEMO_TAG,
    })
    billDocs.push({
      _id: billId, short_id: `DEMO-${billSeq}`, name: t.name, table_id: t.id,
      parent_bill_id: null, split_label: null, status: BillStatus.OPEN, total_amount: total,
      created_by: actorId, cancel_reason: null, created_at: at, updated_at: at, __seed: DEMO_TAG,
    })
    await TableModel.collection.updateOne(
      { _id: t.id },
      { $set: { status: 'OCCUPIED', updatedAt: now }, $addToSet: { bill_ids: billId } },
    )
  }

  // ── Reservations (Lao) ──────────────────────────────────────────────────────
  const reservationDocs: RawDoc[] = []
  for (let i = 0; i < 20; i++) {
    const offsetDays = randInt(-3, 10) // a few past, mostly upcoming
    const day = addDays(today, offsetDays)
    const reservedAt = atLocal(day, pick([16, 17, 18, 19, 20, 21]), pick([0, 30])) // evening bookings
    const status = offsetDays < 0
      ? pick(['CONFIRMED', 'CANCELLED'])
      : pick(['PENDING', 'PENDING', 'CONFIRMED'])
    reservationDocs.push({
      _id: new mongoose.Types.ObjectId(),
      table_id: pick(tables).id,
      reserver_name: pick(RESERVER_NAMES),
      phone: `020${randInt(10_000_000, 99_999_999)}`,
      party_size: randInt(2, 8),
      reserved_at: reservedAt,
      status,
      notes: pick(RESERVE_NOTES),
      created_by: actorId,
      created_at: addDays(reservedAt, -randInt(1, 3)),
      updated_at: addDays(reservedAt, -randInt(0, 1)),
      __seed: DEMO_TAG,
    })
  }

  // ── Audit logs (Lao reasons), referencing seeded bills ─────────────────────
  const auditDocs: RawDoc[] = []
  const auditSample = paidBillRefs.slice(-25)
  for (const ref of auditSample) {
    auditDocs.push({
      _id: new mongoose.Types.ObjectId(),
      actor,
      action: pick(['CREATE', 'UPDATE', 'UPDATE']),
      entity_name: 'Bill',
      entity_id: ref.id,
      reason: pick(AUDIT_REASONS),
      before_state: null,
      after_state: { total_amount: ref.total, name: ref.name },
      created_at: new Date(ref.at.getTime() + 40 * 60_000),
      __seed: DEMO_TAG,
    })
  }

  // ── Table merge group (2 free tables) ──────────────────────────────────────
  const mergeTables = tables.slice(-2).map((t) => t.id)
  const mergeGroupId = new mongoose.Types.ObjectId()
  const mergeDocs: RawDoc[] = [{
    _id: mergeGroupId,
    table_ids: mergeTables,
    created_by: actorId,
    created_at: now,
    __seed: DEMO_TAG,
  }]

  // ── Insert everything ───────────────────────────────────────────────────────
  if (billDocs.length) await BillModel.collection.insertMany(billDocs)
  if (orderDocs.length) await OrderModel.collection.insertMany(orderDocs)
  if (orderItemDocs.length) await OrderItemModel.collection.insertMany(orderItemDocs)
  if (paymentDocs.length) await PaymentModel.collection.insertMany(paymentDocs)
  if (reservationDocs.length) await ReservationModel.collection.insertMany(reservationDocs)
  if (auditDocs.length) await AuditLogModel.collection.insertMany(auditDocs)
  await TableMergeGroupModel.collection.insertMany(mergeDocs)
  await TableModel.collection.updateMany(
    { _id: { $in: mergeTables } },
    { $set: { merge_group_id: mergeGroupId, updatedAt: now } },
  )

  const totalRevenue = paidBillRefs.reduce((s, b) => s + b.total, 0)
  console.log('✓ Demo seed complete:')
  console.log(`  tables:       ${tables.length}`)
  console.log(`  bills:        ${billDocs.length} (${paidBillRefs.length} PAID)`)
  console.log(`  orders:       ${orderDocs.length}`)
  console.log(`  order items:  ${orderItemDocs.length}`)
  console.log(`  payments:     ${paymentDocs.length}`)
  console.log(`  reservations: ${reservationDocs.length}`)
  console.log(`  audit logs:   ${auditDocs.length}`)
  console.log(`  merge groups: ${mergeDocs.length}`)
  console.log(`  total PAID revenue: ₭${totalRevenue.toLocaleString()}`)
  console.log('ℹ Daily comparison (today vs yesterday) is positive. For weekly/monthly/yearly growth,')
  console.log('  pick a fully-elapsed period in the dashboard date picker.')

  await mongoose.disconnect()
}

main().catch((err: unknown) => {
  console.error('✗ Demo seed failed:', err)
  process.exit(1)
})
