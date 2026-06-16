/**
 * End-to-end flow test for the SRMS frontend ↔ backend contract.
 *
 * Drives the live API exactly the way the SRMS service layer does (same
 * endpoints, same payload shapes, Bearer access-token), exercising one full
 * workflow per role: Auth, Waiter, Kitchen, POS/Cashier, Admin.
 *
 * All records it creates are prefixed `TEST-` and removed afterwards via a
 * direct DB cleanup, so today's analytics stay untouched.
 *
 * Run:  npm run test:flows   (server must be running on $PORT)
 */
import mongoose from 'mongoose'
import { UserModel } from '@/models/user.model.js'
import { TableModel } from '@/models/table.model.js'
import { BillModel } from '@/models/bill.model.js'
import { OrderModel } from '@/models/order.model.js'
import { OrderItemModel } from '@/models/order-item.model.js'
import { PaymentModel } from '@/models/payment.model.js'
import { MenuCategoryModel } from '@/models/menu-category.model.js'
import { MenuItemModel } from '@/models/menu-item.model.js'
import { ReservationModel } from '@/models/reservation.model.js'
import { AuditLogModel } from '@/models/audit-log.model.js'

// ─── Config ─────────────────────────────────────────────────────────────────

const PORT = process.env['PORT'] ?? '8080'
const BASE = `http://localhost:${PORT}`
const PREFIX = 'TEST-'
const ADMIN = { username: 'seed_admin', password: 'Seed@1234' }

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const TODAY = ymd(new Date())
const YESTERDAY = ymd(new Date(Date.now() - 86_400_000))

// ─── Result recorder ────────────────────────────────────────────────────────

interface Row {
  role: string
  flow: string
  method: string
  endpoint: string
  expected: number | string
  actual: number | string
  pass: boolean
  note: string
}
const rows: Row[] = []

function rec(
  role: string,
  flow: string,
  method: string,
  endpoint: string,
  expected: number,
  actual: number,
  extraOk = true,
  note = '',
): boolean {
  const pass = actual === expected && extraOk
  rows.push({ role, flow, method, endpoint, expected, actual, pass, note })
  const tag = pass ? '  PASS' : '✗ FAIL'
  console.log(`${tag}  [${role}] ${flow} — ${method} ${endpoint} → ${actual} (expected ${expected})${note ? '  · ' + note : ''}`)
  return pass
}

// ─── HTTP helpers (mirror srms/app/lib/api.ts; uses built-in fetch) ─────────

interface Res { status: number; data: any }
interface Opts { params?: Record<string, unknown> }

function client(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  async function call(method: string, path: string, body?: unknown, opts?: Opts): Promise<Res> {
    const url = new URL(BASE + path)
    if (opts?.params) {
      for (const [k, v] of Object.entries(opts.params)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
      }
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    let data: any = null
    try { data = await res.json() } catch { /* no body */ }
    return { status: res.status, data }
  }

  return {
    get:    (p: string, opts?: Opts) => call('GET', p, undefined, opts),
    post:   (p: string, body?: unknown) => call('POST', p, body),
    patch:  (p: string, body?: unknown) => call('PATCH', p, body),
    delete: (p: string) => call('DELETE', p, undefined),
  }
}

function pickId(obj: Record<string, unknown> | undefined | null): string {
  if (!obj) return ''
  return String(obj['id'] ?? obj['_id'] ?? '')
}

async function loginAs(username: string, password: string): Promise<{ token: string; role: string; status: number }> {
  const res = await client().post('/v1/auth/login', { username, password })
  const data = res.data?.data ?? {}
  return {
    token: String(data.access_token ?? data.accessToken ?? ''),
    role: String(data.user?.role ?? ''),
    status: res.status,
  }
}

// ─── DB cleanup ─────────────────────────────────────────────────────────────

async function cleanup(): Promise<void> {
  const rx = new RegExp('^' + PREFIX)
  const bills = await BillModel.find({ name: rx }).select('_id').lean()
  const billIds = bills.map((b) => b._id)
  const orders = await OrderModel.find({ bill_id: { $in: billIds } }).select('_id').lean()
  const orderIds = orders.map((o) => o._id)

  await OrderItemModel.deleteMany({ order_id: { $in: orderIds } })
  await OrderModel.deleteMany({ _id: { $in: orderIds } })
  await PaymentModel.deleteMany({ bill_id: { $in: billIds } })
  await BillModel.deleteMany({ _id: { $in: billIds } })
  await ReservationModel.deleteMany({ reserver_name: rx })
  await MenuItemModel.deleteMany({ name: rx })
  await MenuCategoryModel.deleteMany({ name: rx })
  await TableModel.deleteMany({ table_name: rx })
  await UserModel.deleteMany({ username: rx })
  await AuditLogModel.deleteMany({ 'actor.username': rx })
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const uri = process.env['MONGODB_URI'] ?? ''
  const dbName = process.env['DB_NAME'] ?? 'tonnam'
  await mongoose.connect(uri, { dbName })
  console.log('✓ Connected to MongoDB for cleanup support\n')

  // Pre-clean any leftovers from an aborted run
  await cleanup()

  // shared state across flows
  let adminToken = ''
  const roleTokens: Record<string, string> = {}
  const tableIds: string[] = []
  let categoryId = ''
  const menuItemIds: string[] = []
  const billIds: string[] = []
  const orderRefs: Array<{ orderId: string; itemId: string }> = []
  let reservationTableId = ''

  try {
    // ===== AUTH =====
    {
      const ok = await loginAs(ADMIN.username, ADMIN.password)
      adminToken = ok.token
      rec('Auth', 'Login (admin, valid)', 'POST', '/v1/auth/login', 200, ok.status, ok.role === 'ADMIN' && !!ok.token,
        ok.role === 'ADMIN' ? '' : `role=${ok.role}`)

      const bad = await client().post('/v1/auth/login', { username: ADMIN.username, password: 'wrong-pass' })
      rec('Auth', 'Login (wrong password)', 'POST', '/v1/auth/login', 401, bad.status)

      const me = await client(adminToken).get('/v1/auth/me')
      rec('Auth', 'Get current user', 'GET', '/v1/auth/me', 200, me.status)

      const noTok = await client().get('/v1/auth/me')
      rec('Auth', 'Reject unauthenticated', 'GET', '/v1/auth/me', 401, noTok.status)
    }

    const adm = client(adminToken)

    // ===== ADMIN SETUP (also exercises Admin create flows) =====
    {
      const roleUsers = [
        { key: 'WAITER', username: PREFIX + 'waiter', phone: '02000000001' },
        { key: 'KITCHEN', username: PREFIX + 'kitchen', phone: '02000000002' },
        { key: 'CASHIER', username: PREFIX + 'cashier', phone: '02000000003' },
      ]
      for (const u of roleUsers) {
        const res = await adm.post('/v1/users', {
          username: u.username,
          first_name: 'Test',
          last_name: u.key,
          phone: u.phone,
          password: 'Test@1234',
          role: u.key,
        })
        rec('Admin', `Create ${u.key} user`, 'POST', '/v1/users', 201, res.status)
        const login = await loginAs(u.username, 'Test@1234')
        roleTokens[u.key] = login.token
        rec('Auth', `Login (${u.key})`, 'POST', '/v1/auth/login', 200, login.status, login.role === u.key,
          login.role === u.key ? '' : `role=${login.role}`)
      }

      // Tables: 2 for service + 1 for reservation (admin can create)
      for (let i = 1; i <= 3; i++) {
        const res = await adm.post('/v1/tables', { table_name: `${PREFIX}T${i}`, capacity: 4, is_temporary: false })
        rec('Admin', `Create table T${i}`, 'POST', '/v1/tables', 201, res.status)
        const id = pickId(res.data?.data)
        if (i === 3) reservationTableId = id
        else tableIds.push(id)
      }

      // Menu category + 2 items
      const cat = await adm.post('/v1/menu-categories', { name: PREFIX + 'cat' })
      rec('Admin', 'Create menu category', 'POST', '/v1/menu-categories', 201, cat.status)
      categoryId = pickId(cat.data?.data)

      for (let i = 1; i <= 2; i++) {
        const item = await adm.post('/v1/menu-items', { category_id: categoryId, name: `${PREFIX}item${i}`, price: 25_000 })
        rec('Admin', `Create menu item ${i}`, 'POST', '/v1/menu-items', 201, item.status)
        menuItemIds.push(pickId(item.data?.data))
      }
    }

    // ===== WAITER FLOW =====
    {
      const w = client(roleTokens['WAITER'])
      const list = await w.get('/v1/tables', { params: { limit: 200 } })
      rec('Waiter', 'List tables', 'GET', '/v1/tables', 200, list.status)

      const cats = await w.get('/v1/menu-categories', { params: { limit: 100 } })
      rec('Waiter', 'List menu categories', 'GET', '/v1/menu-categories', 200, cats.status)
      const items = await w.get('/v1/menu-items', { params: { limit: 500 } })
      rec('Waiter', 'List menu items', 'GET', '/v1/menu-items', 200, items.status)

      // Open both tables + a bill + an order on each
      for (let i = 0; i < tableIds.length; i++) {
        const tId = tableIds[i]!
        const st = await w.patch(`/v1/tables/${tId}/status`, { status: 'OCCUPIED' })
        rec('Waiter', `Open table (OCCUPIED) #${i + 1}`, 'PATCH', '/v1/tables/:id/status', 200, st.status)

        const bill = await w.post('/v1/bills', { table_id: tId, name: `${PREFIX}BILL${i + 1}` })
        rec('Waiter', `Create bill #${i + 1}`, 'POST', '/v1/bills', 201, bill.status)
        const billId = pickId(bill.data?.data)
        billIds.push(billId)

        const order = await w.post('/v1/orders', {
          bill_id: billId,
          items: [{ menu_item_id: menuItemIds[0], quantity: 2, note: 'no spice' }, { menu_item_id: menuItemIds[1], quantity: 1 }],
        })
        const okOrder = rec('Waiter', `Send order to kitchen #${i + 1}`, 'POST', '/v1/orders', 201, order.status)
        if (okOrder) {
          const orderId = pickId(order.data?.data?.order)
          const its: Array<Record<string, unknown>> = order.data?.data?.items ?? []
          for (const it of its) orderRefs.push({ orderId, itemId: pickId(it) })
        }
      }

      // Negative: waiter must NOT be able to take payment
      const pay = client(roleTokens['WAITER']).post('/v1/payments', {
        bill_id: billIds[0], method: 'CASH', amount: 1000, cash: { received_amount: 1000 },
      })
      rec('Waiter', 'Forbidden: create payment (403 expected)', 'POST', '/v1/payments', 403, (await pay).status)
    }

    // ===== KITCHEN FLOW =====
    {
      const k = client(roleTokens['KITCHEN'])
      const waiting = await k.get('/v1/orders', { params: { status: 'SENT_TO_KITCHEN', limit: 50 } })
      rec('Kitchen', 'List waiting orders', 'GET', '/v1/orders', 200, waiting.status)

      // Mark every seeded item COOKED
      let allCooked = true
      for (const ref of orderRefs) {
        const res = await k.patch(`/v1/orders/${ref.orderId}/items/${ref.itemId}`, { status: 'COOKED' })
        if (res.status !== 200) allCooked = false
      }
      rec('Kitchen', `Mark order items COOKED (${orderRefs.length})`, 'PATCH', '/v1/orders/:id/items/:itemId', 200,
        allCooked ? 200 : 0, allCooked)

      // Negative: kitchen must NOT be able to create orders
      const create = await k.post('/v1/orders', { bill_id: billIds[0], items: [{ menu_item_id: menuItemIds[0], quantity: 1 }] })
      rec('Kitchen', 'Forbidden: create order (403 expected)', 'POST', '/v1/orders', 403, create.status)
    }

    // ===== POS / CASHIER FLOW =====
    {
      const c = client(roleTokens['CASHIER'])
      const list = await c.get('/v1/bills', { params: { limit: 50, status: 'OPEN' } })
      rec('POS', 'List bills', 'GET', '/v1/bills', 200, list.status)

      // Bill #1 → edit name (reason → AuditLog) → pay CASH → clear table
      const b1 = billIds[0]!
      const detail = await c.get(`/v1/bills/${b1}`)
      rec('POS', 'Get bill detail', 'GET', '/v1/bills/:id', 200, detail.status)
      const total1: number = Number(detail.data?.data?.bill?.total_amount ?? 0)

      const edit = await c.patch(`/v1/bills/${b1}`, { name: `${PREFIX}BILL1-edited`, reason: 'TEST edit name' })
      rec('POS', 'Edit bill (requires reason)', 'PATCH', '/v1/bills/:id', 200, edit.status)

      const payCash = await c.post('/v1/payments', {
        bill_id: b1, method: 'CASH', amount: total1, cash: { received_amount: total1 },
      })
      rec('POS', 'Pay bill (CASH)', 'POST', '/v1/payments', 201, payCash.status, true, `total=${total1}`)

      // table should be PAID now; cashier clears it back to AVAILABLE
      const clear = await c.patch(`/v1/tables/${tableIds[0]}/status`, { status: 'AVAILABLE' })
      rec('POS', 'Clear table (→ AVAILABLE)', 'PATCH', '/v1/tables/:id/status', 200, clear.status)

      // Bill #2 → pay QR_PROMPTPAY (validates the QR payload branch)
      const b2 = billIds[1]!
      const detail2 = await c.get(`/v1/bills/${b2}`)
      const total2: number = Number(detail2.data?.data?.bill?.total_amount ?? 0)
      const payQr = await c.post('/v1/payments', {
        bill_id: b2, method: 'QR_PROMPTPAY', amount: total2, qr_promptpay: { received_amount: total2 },
      })
      rec('POS', 'Pay bill (QR_PROMPTPAY)', 'POST', '/v1/payments', 201, payQr.status, true, `total=${total2}`)
    }

    // ===== ADMIN FLOW =====
    {
      // Menu CRUD round-trip on a throwaway category/item
      const cat = await adm.post('/v1/menu-categories', { name: PREFIX + 'crud-cat' })
      rec('Admin', 'Menu category create', 'POST', '/v1/menu-categories', 201, cat.status)
      const catId = pickId(cat.data?.data)
      const catUpd = await adm.patch(`/v1/menu-categories/${catId}`, { name: PREFIX + 'crud-cat2' })
      rec('Admin', 'Menu category update', 'PATCH', '/v1/menu-categories/:id', 200, catUpd.status)

      const avail = await adm.patch(`/v1/menu-items/${menuItemIds[0]}/availability`, { is_available: true, is_sold_out: false })
      rec('Admin', 'Toggle menu item availability', 'PATCH', '/v1/menu-items/:id/availability', 200, avail.status)

      const catDel = await adm.delete(`/v1/menu-categories/${catId}`)
      rec('Admin', 'Menu category delete', 'DELETE', '/v1/menu-categories/:id', 200, catDel.status)

      const users = await adm.get('/v1/users', { params: { limit: 200 } })
      rec('Admin', 'List users', 'GET', '/v1/users', 200, users.status)

      // Reservation create → confirm
      const future = new Date(Date.now() + 3 * 86_400_000).toISOString()
      const resv = await adm.post('/v1/reservations', {
        table_id: reservationTableId, reserver_name: PREFIX + 'guest', phone: '02000000009',
        party_size: 4, reserved_at: future, notes: 'TEST reservation',
      })
      const okResv = rec('Admin', 'Create reservation', 'POST', '/v1/reservations', 201, resv.status)
      if (okResv) {
        const rId = pickId(resv.data?.data)
        const upd = await adm.patch(`/v1/reservations/${rId}/status`, { status: 'CONFIRMED' })
        rec('Admin', 'Update reservation status', 'PATCH', '/v1/reservations/:id/status', 200, upd.status)
      }

      // Audit log: confirm the cashier's bill-edit reason landed
      const logs = await adm.get('/v1/audit-logs', { params: { limit: 50 } })
      const found = (logs.data?.data ?? []).some((l: Record<string, unknown>) => String(l['reason'] ?? '').includes('TEST edit name'))
      rec('Admin', 'List audit logs (bill-edit reason present)', 'GET', '/v1/audit-logs', 200, logs.status, found,
        found ? '' : 'edit reason not found in latest logs')

      // Analytics — all 6 endpoints
      const a = adm
      const r1 = await a.get('/v1/analytics/sales/summary', { params: { period: 'daily', date: TODAY } })
      rec('Admin', 'Analytics: sales summary', 'GET', '/v1/analytics/sales/summary', 200, r1.status)
      const r2 = await a.get('/v1/analytics/sales/comparison', { params: { period: 'daily', current_date: TODAY, previous_date: YESTERDAY } })
      rec('Admin', 'Analytics: sales comparison', 'GET', '/v1/analytics/sales/comparison', 200, r2.status)
      const r3 = await a.get('/v1/analytics/sales/by-category', { params: { period: 'daily', date: TODAY } })
      rec('Admin', 'Analytics: sales by category', 'GET', '/v1/analytics/sales/by-category', 200, r3.status)
      const r4 = await a.get('/v1/analytics/menu/best-sellers', { params: { period: 'daily', date: TODAY, limit: 10 } })
      rec('Admin', 'Analytics: best sellers', 'GET', '/v1/analytics/menu/best-sellers', 200, r4.status)
      const r5 = await a.get('/v1/analytics/menu/dead-items', { params: { period: 'weekly', date: TODAY, threshold: 5 } })
      rec('Admin', 'Analytics: dead items', 'GET', '/v1/analytics/menu/dead-items', 200, r5.status)
      const r6 = await a.get('/v1/analytics/menu/mix', { params: { period: 'daily', date: TODAY } })
      rec('Admin', 'Analytics: menu mix', 'GET', '/v1/analytics/menu/mix', 200, r6.status)
    }
  } finally {
    // ===== CLEANUP =====
    await cleanup()
    const leftover = await BillModel.countDocuments({ name: new RegExp('^' + PREFIX) })
      + await UserModel.countDocuments({ username: new RegExp('^' + PREFIX) })
      + await TableModel.countDocuments({ table_name: new RegExp('^' + PREFIX) })
    console.log(`\n✓ Cleanup done — ${leftover} TEST- records remaining (expected 0)`)
    await mongoose.disconnect()
  }

  // ===== SUMMARY =====
  const pass = rows.filter((r) => r.pass).length
  const fail = rows.length - pass
  console.log('\n══════════════════════ SUMMARY ══════════════════════')
  const byRole = new Map<string, { p: number; f: number }>()
  for (const r of rows) {
    const e = byRole.get(r.role) ?? { p: 0, f: 0 }
    if (r.pass) e.p++; else e.f++
    byRole.set(r.role, e)
  }
  for (const [role, e] of byRole) {
    console.log(`  ${role.padEnd(8)}  ${e.p} pass / ${e.f} fail`)
  }
  console.log('──────────────────────────────────────────────────────')
  console.log(`  TOTAL     ${pass} pass / ${fail} fail  (of ${rows.length})`)
  if (fail > 0) {
    console.log('\n  Failures:')
    for (const r of rows.filter((x) => !x.pass)) {
      console.log(`   ✗ [${r.role}] ${r.flow} — ${r.method} ${r.endpoint}: got ${r.actual}, expected ${r.expected}${r.note ? ' · ' + r.note : ''}`)
    }
  }
  console.log('══════════════════════════════════════════════════════')

  process.exit(fail > 0 ? 1 : 0)
}

main().catch((err: unknown) => {
  console.error('✗ Test runner crashed:', err)
  process.exit(1)
})
