import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as AnalyticsService from '@/services/analytics.service.js'

// ─── Model mocks ──────────────────────────────────────────────────────────────

jest.unstable_mockModule('@/models/bill.model.js', () => ({
  BillModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/payment.model.js', () => ({
  PaymentModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/order.model.js', () => ({
  OrderModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/order-item.model.js', () => ({
  OrderItemModel: { aggregate: jest.fn() },
}))

jest.unstable_mockModule('@/models/menu-item.model.js', () => ({
  MenuItemModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/menu-category.model.js', () => ({
  MenuCategoryModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts })),
}))

// ─── Let declarations ─────────────────────────────────────────────────────────

let getSalesSummary: typeof AnalyticsService.getSalesSummary
let getSalesComparison: typeof AnalyticsService.getSalesComparison
let getMenuBestSellers: typeof AnalyticsService.getMenuBestSellers
let getMenuDeadItems: typeof AnalyticsService.getMenuDeadItems
let getMenuMix: typeof AnalyticsService.getMenuMix

let mockBillFind: jest.Mock
let mockPaymentFind: jest.Mock
let mockOrderFind: jest.Mock
let mockOrderItemAggregate: jest.Mock
let mockMenuItemFind: jest.Mock
let mockMenuCategoryFind: jest.Mock

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const billModelMod = await import('@/models/bill.model.js')
  const paymentModelMod = await import('@/models/payment.model.js')
  const orderModelMod = await import('@/models/order.model.js')
  const orderItemModelMod = await import('@/models/order-item.model.js')
  const menuItemModelMod = await import('@/models/menu-item.model.js')
  const menuCategoryModelMod = await import('@/models/menu-category.model.js')
  const serviceMod = await import('@/services/analytics.service.js')

  mockBillFind = (billModelMod.BillModel as { find: jest.Mock }).find
  mockPaymentFind = (paymentModelMod.PaymentModel as { find: jest.Mock }).find
  mockOrderFind = (orderModelMod.OrderModel as { find: jest.Mock }).find
  mockOrderItemAggregate = (orderItemModelMod.OrderItemModel as { aggregate: jest.Mock }).aggregate
  mockMenuItemFind = (menuItemModelMod.MenuItemModel as { find: jest.Mock }).find
  mockMenuCategoryFind = (menuCategoryModelMod.MenuCategoryModel as { find: jest.Mock }).find

  getSalesSummary = serviceMod.getSalesSummary
  getSalesComparison = serviceMod.getSalesComparison
  getMenuBestSellers = serviceMod.getMenuBestSellers
  getMenuDeadItems = serviceMod.getMenuDeadItems
  getMenuMix = serviceMod.getMenuMix
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBills = [
  { _id: 'bill1', status: 'PAID', total_amount: 560, created_at: new Date('2025-05-20T10:30:00Z') },
  { _id: 'bill2', status: 'PAID', total_amount: 420, created_at: new Date('2025-05-20T14:15:00Z') },
]
const mockPayments = [
  { _id: 'pay1', bill_id: 'bill1', method: 'CASH',        amount: 560, cash: { amount: 560 }, qr_promptpay: null },
  { _id: 'pay2', bill_id: 'bill2', method: 'QR_PROMPTPAY', amount: 420, cash: null, qr_promptpay: { amount: 420 } },
]
const mockOrders = [
  { _id: 'ord1', bill_id: 'bill1' },
  { _id: 'ord2', bill_id: 'bill2' },
]
const mockAggregateResult = [
  { _id: 'menuItem1', total_quantity_sold: 15, total_revenue: 3000 },
  { _id: 'menuItem2', total_quantity_sold: 8,  total_revenue: 1600 },
]
const mockCategories = [
  { _id: 'cat1', name: 'อาหารจานหลัก' },
  { _id: 'cat2', name: 'เครื่องดื่ม' },
]
const mockMenuItems = [
  { _id: 'menuItem1', name: 'ผัดไทย',    category_id: 'cat1', price: 200, is_available: true, is_sold_out: false },
  { _id: 'menuItem2', name: 'น้ำมะนาว', category_id: 'cat2', price: 200, is_available: true, is_sold_out: false },
  { _id: 'menuItem3', name: 'ต้มยำกุ้ง', category_id: 'cat1', price: 280, is_available: true, is_sold_out: false },
]

// ─── getSalesSummary() ────────────────────────────────────────────────────────

describe('getSalesSummary()', () => {
  beforeEach(() => {
    mockBillFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBills) })
    mockPaymentFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockPayments) })
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockOrders) })
  })

  it('returns correct totals for daily period', async () => {
    const result = await getSalesSummary({ period: 'daily', date: '2025-05-20' })

    expect(result.total_revenue).toBe(980)
    expect(result.total_bills).toBe(2)
    expect(result.total_orders).toBe(2)
    expect(result.average_bill_amount).toBe(490)
  })

  it('returns correct payment_breakdown', async () => {
    const result = await getSalesSummary({ period: 'daily', date: '2025-05-20' })

    expect(result.payment_breakdown.cash).toBe(560)
    expect(result.payment_breakdown.qr_promptpay).toBe(420)
  })

  it('returns hourly breakdown for daily period with 24 entries', async () => {
    const result = await getSalesSummary({ period: 'daily', date: '2025-05-20' })

    expect(result.breakdown).toHaveLength(24)
    const hour10 = (result.breakdown as Array<{ hour: number; revenue: number; bills: number }>)
      .find((h) => h.hour === 10)
    expect(hour10?.revenue).toBe(560)
    expect(hour10?.bills).toBe(1)
  })

  it('returns 0 totals when no bills in range', async () => {
    mockBillFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })
    mockPaymentFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

    const result = await getSalesSummary({ period: 'daily', date: '2025-05-20' })

    expect(result.total_revenue).toBe(0)
    expect(result.total_bills).toBe(0)
    expect(result.average_bill_amount).toBe(0)
  })

  it('returns daily breakdown for weekly period with 7 entries', async () => {
    const result = await getSalesSummary({ period: 'weekly', date: '2025-05-20' })

    expect(result.breakdown).toHaveLength(7)
  })

  it('returns monthly breakdown for yearly period with 12 entries', async () => {
    const result = await getSalesSummary({ period: 'yearly', date: '2025-05-20' })

    expect(result.breakdown).toHaveLength(12)
  })
})

// ─── getSalesComparison() ─────────────────────────────────────────────────────

describe('getSalesComparison()', () => {
  it('returns comparison with correct change metrics', async () => {
    mockBillFind
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockBills) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue([mockBills[0]!]) })
    mockPaymentFind
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockPayments) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue([mockPayments[0]!]) })
    mockOrderFind
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockOrders) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue([mockOrders[0]!]) })

    const result = await getSalesComparison({
      period: 'daily',
      current_date: '2025-05-20',
      previous_date: '2025-05-19',
    })

    expect(result.current.total_revenue).toBe(980)
    expect(result.previous.total_revenue).toBe(560)
    expect(result.changes.revenue_change).toBe(420)
    expect(result.changes.revenue_change_percent).toBeCloseTo(75, 0)
  })
})

// ─── getMenuBestSellers() ─────────────────────────────────────────────────────

describe('getMenuBestSellers()', () => {
  it('returns items ranked by quantity sold', async () => {
    mockOrderItemAggregate.mockResolvedValue(mockAggregateResult)
    mockMenuCategoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategories) })

    const result = await getMenuBestSellers({ period: 'monthly', date: '2025-05-01', limit: 10 })

    expect(result.items).toHaveLength(2)
    expect(result.items[0]?.rank).toBe(1)
    expect(result.items[0]?.total_quantity_sold).toBe(15)
    expect(result.items[1]?.rank).toBe(2)
  })

  it('returns empty items when no orders in range', async () => {
    mockOrderItemAggregate.mockResolvedValue([])
    mockMenuCategoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

    const result = await getMenuBestSellers({ period: 'daily', date: '2025-05-20', limit: 10 })

    expect(result.items).toHaveLength(0)
  })
})

// ─── getMenuDeadItems() ───────────────────────────────────────────────────────

describe('getMenuDeadItems()', () => {
  it('returns items sold below threshold', async () => {
    mockOrderItemAggregate.mockResolvedValue(mockAggregateResult)
    mockMenuItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockMenuItems) })
    mockMenuCategoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategories) })

    const result = await getMenuDeadItems({ period: 'monthly', date: '2025-05-01', threshold: 5 })

    expect(result.threshold).toBe(5)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.menu_item_id).toBe('menuItem3')
    expect(result.items[0]?.total_quantity_sold).toBe(0)
  })

  it('returns all items when no sales in period', async () => {
    mockOrderItemAggregate.mockResolvedValue([])
    mockMenuItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockMenuItems) })
    mockMenuCategoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategories) })

    const result = await getMenuDeadItems({ period: 'monthly', date: '2025-05-01', threshold: 5 })

    expect(result.items).toHaveLength(3)
  })
})

// ─── getMenuMix() ─────────────────────────────────────────────────────────────

describe('getMenuMix()', () => {
  it('calculates quantity_percentage and revenue_percentage correctly', async () => {
    mockOrderItemAggregate.mockResolvedValue(mockAggregateResult)
    mockMenuCategoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategories) })

    const result = await getMenuMix({ period: 'monthly', date: '2025-05-01' })

    expect(result.total_items_sold).toBe(23)
    expect(result.total_revenue).toBe(4600)
    expect(result.items[0]?.quantity_percentage).toBeCloseTo(65.22, 1)
    expect(result.items[0]?.revenue_percentage).toBeCloseTo(65.22, 1)
  })
})
