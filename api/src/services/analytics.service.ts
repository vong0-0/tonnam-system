import mongoose from 'mongoose'
import { type IBill, BillModel } from '@/models/bill.model.js'
import { type IPayment, PaymentModel } from '@/models/payment.model.js'
import { OrderModel } from '@/models/order.model.js'
import { OrderItemModel } from '@/models/order-item.model.js'
import { type IMenuItem, MenuItemModel } from '@/models/menu-item.model.js'
import { MenuCategoryModel } from '@/models/menu-category.model.js'
import type {
  SalesSummaryQuery,
  SalesComparisonQuery,
  SalesByCategoryQuery,
  MenuBestSellersQuery,
  MenuDeadItemsQuery,
  MenuMixQuery,
} from '@/schemas/analytics.schema.js'
import { BillStatus, PaymentMethod } from '@/types/index.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CategoryAggResult {
  _id: mongoose.Types.ObjectId
  revenue: number
  total_items_sold: number
}

interface ItemAggResult {
  _id: mongoose.Types.ObjectId
  total_quantity_sold: number
  total_revenue: number
  name: string
  category_id: mongoose.Types.ObjectId
}

function getDateRange(period: string, date: string): { start: Date; end: Date } {
  const ref = new Date(date)

  if (period === 'daily') {
    return {
      start: new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate())),
      end: new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate(), 23, 59, 59, 999)),
    }
  }

  if (period === 'weekly') {
    const day = ref.getUTCDay()
    const offset = day === 0 ? -6 : 1 - day
    const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate() + offset))
    return {
      start,
      end: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999)),
    }
  }

  if (period === 'monthly') {
    return {
      start: new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1)),
      end: new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 0, 23, 59, 59, 999)),
    }
  }

  // yearly
  return {
    start: new Date(Date.UTC(ref.getUTCFullYear(), 0, 1)),
    end: new Date(Date.UTC(ref.getUTCFullYear(), 11, 31, 23, 59, 59, 999)),
  }
}

function toDateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function buildBasePipeline(start: Date, end: Date): mongoose.PipelineStage[] {
  return [
    { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
    { $unwind: '$order' },
    { $lookup: { from: 'bills', localField: 'order.bill_id', foreignField: '_id', as: 'bill' } },
    { $unwind: '$bill' },
    {
      $match: {
        'bill.status': 'PAID',
        'bill.created_at': { $gte: start, $lte: end },
        status: { $ne: 'CANCELLED' },
      },
    },
    { $lookup: { from: 'menuitems', localField: 'menu_item_id', foreignField: '_id', as: 'menu_item' } },
    { $unwind: '$menu_item' },
  ]
}

export async function getSalesSummary(query: SalesSummaryQuery) {
  const { start, end } = getDateRange(query.period, query.date)

  const bills = (await BillModel.find({ status: BillStatus.PAID, created_at: { $gte: start, $lte: end } }).lean()) as IBill[]
  const billIds = bills.map((b) => b._id)

  const [payments, orders] = await Promise.all([
    PaymentModel.find({ bill_id: { $in: billIds } }).lean() as Promise<IPayment[]>,
    OrderModel.find({ bill_id: { $in: billIds } }).lean(),
  ])

  const total_revenue = bills.reduce((sum, b) => sum + b.total_amount, 0)
  const total_bills = bills.length
  const total_orders = orders.length
  const average_bill_amount = total_bills > 0 ? total_revenue / total_bills : 0

  let cashTotal = 0
  let qrTotal = 0
  for (const payment of payments) {
    if (payment.method === PaymentMethod.CASH) {
      cashTotal += payment.cash?.amount ?? 0
    } else if (payment.method === PaymentMethod.QR_PROMPTPAY) {
      qrTotal += payment.qr_promptpay?.amount ?? 0
    } else if (payment.method === PaymentMethod.MIXED) {
      cashTotal += payment.cash?.amount ?? 0
      qrTotal += payment.qr_promptpay?.amount ?? 0
    }
  }

  let breakdown: unknown
  let peak: { label: string; revenue: number; bills: number }

  if (query.period === 'daily') {
    const hourlyMap = new Map<number, { revenue: number; bills: number }>()
    for (const bill of bills) {
      const hour = new Date(bill.created_at).getHours()
      const curr = hourlyMap.get(hour) ?? { revenue: 0, bills: 0 }
      hourlyMap.set(hour, { revenue: curr.revenue + bill.total_amount, bills: curr.bills + 1 })
    }
    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyMap.get(hour) ?? { revenue: 0, bills: 0 }
      return { hour, revenue: data.revenue, bills: data.bills }
    })
    breakdown = hourlyBreakdown
    peak = { label: '', revenue: 0, bills: 0 }
    for (const item of hourlyBreakdown) {
      if (item.revenue > peak.revenue) {
        const h = String(item.hour).padStart(2, '0')
        const h1 = String((item.hour + 1) % 24).padStart(2, '0')
        peak = { label: `${h}:00 - ${h1}:00`, revenue: item.revenue, bills: item.bills }
      }
    }
  } else if (query.period === 'weekly' || query.period === 'monthly') {
    const dailyMap = new Map<string, { revenue: number; bills: number }>()
    for (const bill of bills) {
      const key = toDateKey(new Date(bill.created_at))
      const curr = dailyMap.get(key) ?? { revenue: 0, bills: 0 }
      dailyMap.set(key, { revenue: curr.revenue + bill.total_amount, bills: curr.bills + 1 })
    }
    const allDays: Array<{ date: string; day: string; revenue: number; bills: number }> = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const key = toDateKey(cursor)
      const data = dailyMap.get(key) ?? { revenue: 0, bills: 0 }
      allDays.push({ date: key, day: DAY_NAMES[cursor.getUTCDay()] ?? '', ...data })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    breakdown = allDays
    peak = { label: allDays[0]?.date ?? '', revenue: 0, bills: 0 }
    for (const item of allDays) {
      if (item.revenue > peak.revenue) {
        peak = { label: item.date, revenue: item.revenue, bills: item.bills }
      }
    }
  } else {
    // yearly
    const monthlyMap = new Map<number, { revenue: number; bills: number }>()
    for (const bill of bills) {
      const month = new Date(bill.created_at).getUTCMonth()
      const curr = monthlyMap.get(month) ?? { revenue: 0, bills: 0 }
      monthlyMap.set(month, { revenue: curr.revenue + bill.total_amount, bills: curr.bills + 1 })
    }
    const monthlyBreakdown = MONTH_NAMES.map((monthName, idx) => {
      const data = monthlyMap.get(idx) ?? { revenue: 0, bills: 0 }
      return { month: monthName, revenue: data.revenue, bills: data.bills }
    })
    breakdown = monthlyBreakdown
    peak = { label: '', revenue: 0, bills: 0 }
    for (const item of monthlyBreakdown) {
      if (item.revenue > peak.revenue) {
        peak = { label: item.month, revenue: item.revenue, bills: item.bills }
      }
    }
  }

  return {
    period: query.period,
    date: query.date,
    total_revenue,
    total_bills,
    total_orders,
    average_bill_amount,
    payment_breakdown: { cash: cashTotal, qr_promptpay: qrTotal },
    peak,
    breakdown,
  }
}

export async function getSalesComparison(query: SalesComparisonQuery) {
  const [current, previous] = await Promise.all([
    getSalesSummary({ period: query.period, date: query.current_date }),
    getSalesSummary({ period: query.period, date: query.previous_date }),
  ])

  const revenue_change = current.total_revenue - previous.total_revenue
  const revenue_change_percent =
    previous.total_revenue > 0 ? (revenue_change / previous.total_revenue) * 100 : 0
  const bills_change = current.total_bills - previous.total_bills
  const bills_change_percent =
    previous.total_bills > 0 ? (bills_change / previous.total_bills) * 100 : 0
  const orders_change = current.total_orders - previous.total_orders
  const orders_change_percent =
    previous.total_orders > 0 ? (orders_change / previous.total_orders) * 100 : 0

  return {
    period: query.period,
    current: {
      date: query.current_date,
      total_revenue: current.total_revenue,
      total_bills: current.total_bills,
      total_orders: current.total_orders,
    },
    previous: {
      date: query.previous_date,
      total_revenue: previous.total_revenue,
      total_bills: previous.total_bills,
      total_orders: previous.total_orders,
    },
    changes: {
      revenue_change,
      revenue_change_percent,
      bills_change,
      bills_change_percent,
      orders_change,
      orders_change_percent,
    },
  }
}

export async function getSalesByCategory(query: SalesByCategoryQuery) {
  const { start, end } = getDateRange(query.period, query.date)

  const result = await OrderItemModel.aggregate<CategoryAggResult>([
    ...buildBasePipeline(start, end),
    {
      $group: {
        _id: '$menu_item.category_id',
        revenue: { $sum: { $multiply: ['$unit_price', '$quantity'] } },
        total_items_sold: { $sum: '$quantity' },
      },
    },
  ])

  const categoryIds = result.map((r) => r._id)
  const categories = await MenuCategoryModel.find({ _id: { $in: categoryIds } }).lean()
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]))

  const total_revenue = result.reduce((sum, r) => sum + r.revenue, 0)

  const categoryList = result
    .map((r) => ({
      category_id: String(r._id),
      category_name: catMap.get(String(r._id)) ?? 'Unknown',
      revenue: r.revenue,
      percentage: total_revenue > 0 ? (r.revenue / total_revenue) * 100 : 0,
      total_items_sold: r.total_items_sold,
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return { period: query.period, date: query.date, total_revenue, categories: categoryList }
}

export async function getMenuBestSellers(query: MenuBestSellersQuery) {
  const { start, end } = getDateRange(query.period, query.date)

  const result = await OrderItemModel.aggregate<ItemAggResult>([
    ...buildBasePipeline(start, end),
    {
      $group: {
        _id: '$menu_item_id',
        total_quantity_sold: { $sum: '$quantity' },
        total_revenue: { $sum: { $multiply: ['$unit_price', '$quantity'] } },
        name: { $first: '$menu_item.name' },
        category_id: { $first: '$menu_item.category_id' },
      },
    },
    { $sort: { total_quantity_sold: -1 } },
    { $limit: query.limit },
  ])

  const categoryIds = result.map((r) => r.category_id)
  const categories = await MenuCategoryModel.find({ _id: { $in: categoryIds } }).lean()
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]))

  return {
    period: query.period,
    date: query.date,
    items: result.map((r, idx) => ({
      menu_item_id: String(r._id),
      name: r.name,
      category_name: catMap.get(String(r.category_id)) ?? 'Unknown',
      total_quantity_sold: r.total_quantity_sold,
      total_revenue: r.total_revenue,
      rank: idx + 1,
    })),
  }
}

export async function getMenuDeadItems(query: MenuDeadItemsQuery) {
  const { start, end } = getDateRange(query.period, query.date)

  const soldResults = await OrderItemModel.aggregate<ItemAggResult>([
    ...buildBasePipeline(start, end),
    {
      $group: {
        _id: '$menu_item_id',
        total_quantity_sold: { $sum: '$quantity' },
        total_revenue: { $sum: { $multiply: ['$unit_price', '$quantity'] } },
        name: { $first: '$menu_item.name' },
        category_id: { $first: '$menu_item.category_id' },
      },
    },
  ])

  const soldMap = new Map(soldResults.map((r) => [String(r._id), r]))

  const allItems = (await MenuItemModel.find({}).lean()) as IMenuItem[]

  const deadItems = allItems.filter(
    (item) => (soldMap.get(String(item._id))?.total_quantity_sold ?? 0) < query.threshold,
  )

  const categoryIds = deadItems.map((item) => item.category_id)
  const categories = await MenuCategoryModel.find({ _id: { $in: categoryIds } }).lean()
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]))

  const items = deadItems
    .map((item) => {
      const soldData = soldMap.get(String(item._id))
      return {
        menu_item_id: String(item._id),
        name: item.name,
        category_name: catMap.get(String(item.category_id)) ?? 'Unknown',
        total_quantity_sold: soldData?.total_quantity_sold ?? 0,
        total_revenue: soldData?.total_revenue ?? 0,
        unit_price: item.price,
        is_available: item.is_available,
        is_sold_out: item.is_sold_out,
      }
    })
    .sort((a, b) => a.total_quantity_sold - b.total_quantity_sold)

  return { period: query.period, date: query.date, threshold: query.threshold, items }
}

export async function getMenuMix(query: MenuMixQuery) {
  const { start, end } = getDateRange(query.period, query.date)

  const pipeline: mongoose.PipelineStage[] = [...buildBasePipeline(start, end)]

  if (query.category_id !== undefined) {
    pipeline.push({
      $match: { 'menu_item.category_id': new mongoose.Types.ObjectId(query.category_id) },
    })
  }

  pipeline.push({
    $group: {
      _id: '$menu_item_id',
      total_quantity_sold: { $sum: '$quantity' },
      total_revenue: { $sum: { $multiply: ['$unit_price', '$quantity'] } },
      name: { $first: '$menu_item.name' },
      category_id: { $first: '$menu_item.category_id' },
    },
  })

  const result = await OrderItemModel.aggregate<ItemAggResult>(pipeline)

  const total_items_sold = result.reduce((sum, r) => sum + r.total_quantity_sold, 0)
  const total_revenue = result.reduce((sum, r) => sum + r.total_revenue, 0)

  const categoryIds = result.map((r) => r.category_id)
  const categories = await MenuCategoryModel.find({ _id: { $in: categoryIds } }).lean()
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]))

  const items = result
    .map((r) => ({
      menu_item_id: String(r._id),
      name: r.name,
      category_name: catMap.get(String(r.category_id)) ?? 'Unknown',
      total_quantity_sold: r.total_quantity_sold,
      total_revenue: r.total_revenue,
      quantity_percentage: total_items_sold > 0 ? (r.total_quantity_sold / total_items_sold) * 100 : 0,
      revenue_percentage: total_revenue > 0 ? (r.total_revenue / total_revenue) * 100 : 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)

  return { period: query.period, date: query.date, total_items_sold, total_revenue, items }
}
