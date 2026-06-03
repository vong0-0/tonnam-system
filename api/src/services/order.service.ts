import mongoose from 'mongoose'
import { type IOrder, OrderModel } from '@/models/order.model.js'
import { type IOrderItem, OrderItemModel } from '@/models/order-item.model.js'
import { type IBill, BillModel } from '@/models/bill.model.js'
import { type IMenuItem, MenuItemModel } from '@/models/menu-item.model.js'
import { createAuditLog } from '@/services/audit-log.service.js'
import { recalculateBillTotal } from '@/services/bill.service.js'
import { OrderStatus, OrderItemStatus, BillStatus, type Pagination } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'
import { successList, type SuccessListResponse } from '@/utils/response.js'
import { io } from '@/websocket/handlers.js'
import { WS_EVENTS } from '@/websocket/events.js'

interface CounterDoc {
  _id: string
  seq: number
}

export interface OrderWithItems {
  order: IOrder
  items: IOrderItem[]
}

interface CreateOrderItemInput {
  menu_item_id: string
  quantity: number
  note?: string
}

interface CreateOrderInput {
  bill_id: string
  items: CreateOrderItemInput[]
  created_by: string
}

interface ListOrdersQuery {
  page?: number
  limit?: number
  bill_id?: string
  status?: string
}

interface ActorInput {
  id: string
  username: string
  role: string
}

interface UpdateOrderItemStatusInput {
  order_id: string
  item_id: string
  status: OrderItemStatus
  reason?: string
  actor: ActorInput
}

interface UpdateOrderItemQuantityInput {
  order_id: string
  item_id: string
  quantity: number
  reason: string
  actor: ActorInput
}

async function generateOrderShortId(): Promise<string> {
  const result = await mongoose.connection
    .collection<CounterDoc>('counters')
    .findOneAndUpdate(
      { _id: 'order' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true },
    )
  const seq = result?.seq ?? 1
  return `O-${seq.toString().padStart(4, '0')}`
}

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  if (!mongoose.Types.ObjectId.isValid(input.bill_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Bill not found.',
      instance: '/v1/orders',
    })
  }

  const bill = (await BillModel.findById(input.bill_id).lean()) as IBill | null
  if (!bill) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Bill not found.',
      instance: '/v1/orders',
    })
  }

  if (bill.status !== BillStatus.OPEN) {
    throw problem({
      type: 'BILL_NOT_OPEN',
      title: 'Conflict',
      status: 409,
      detail: `Cannot create order for a bill with status ${bill.status}.`,
      instance: '/v1/orders',
    })
  }

  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      if (!mongoose.Types.ObjectId.isValid(item.menu_item_id)) {
        throw problem({
          type: 'not-found',
          title: 'Not Found',
          status: 404,
          detail: `Menu item ${item.menu_item_id} not found.`,
          instance: '/v1/orders',
        })
      }

      const menuItem = (await MenuItemModel.findById(item.menu_item_id).lean()) as IMenuItem | null
      if (!menuItem) {
        throw problem({
          type: 'not-found',
          title: 'Not Found',
          status: 404,
          detail: `Menu item ${item.menu_item_id} not found.`,
          instance: '/v1/orders',
        })
      }

      if (!menuItem.is_available) {
        throw problem({
          type: 'MENU_ITEM_NOT_AVAILABLE',
          title: 'Conflict',
          status: 409,
          detail: `Menu item "${menuItem.name}" is not available.`,
          instance: '/v1/orders',
        })
      }

      if (menuItem.is_sold_out) {
        throw problem({
          type: 'MENU_ITEM_SOLD_OUT',
          title: 'Conflict',
          status: 409,
          detail: `Menu item "${menuItem.name}" is sold out.`,
          instance: '/v1/orders',
        })
      }

      return {
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        note: item.note,
        unit_price: menuItem.price,
      }
    }),
  )

  const short_id = await generateOrderShortId()

  const order = await OrderModel.create({
    short_id,
    bill_id: new mongoose.Types.ObjectId(input.bill_id),
    status: OrderStatus.SENT_TO_KITCHEN,
    created_by: new mongoose.Types.ObjectId(input.created_by),
  })

  await OrderItemModel.insertMany(
    resolvedItems.map((item) => ({
      order_id: order._id,
      menu_item_id: new mongoose.Types.ObjectId(item.menu_item_id),
      quantity: item.quantity,
      unit_price: item.unit_price,
      note: item.note ?? null,
      status: null,
    })),
  )

  const items = (await OrderItemModel.find({ order_id: order._id }).lean()) as IOrderItem[]

  await recalculateBillTotal(input.bill_id)

  io.to('orders').emit('message', JSON.stringify({
    event: WS_EVENTS.ORDER_NEW_ORDER_RECEIVED,
    channel: 'orders',
    data: { order, items },
    timestamp: new Date().toISOString(),
  }))
  io.to('kitchen').emit('message', JSON.stringify({
    event: WS_EVENTS.ORDER_NEW_ORDER_RECEIVED,
    channel: 'kitchen',
    data: { order, items },
    timestamp: new Date().toISOString(),
  }))

  logger.info('Order created', {
    orderId: String(order._id),
    shortId: short_id,
    billId: input.bill_id,
  })

  return { order, items }
}

export async function getOrderById(id: string): Promise<OrderWithItems> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${id}`,
    })
  }

  const order = (await OrderModel.findById(id).lean()) as IOrder | null
  if (!order) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${id}`,
    })
  }

  const items = (await OrderItemModel.find({ order_id: order._id }).lean()) as IOrderItem[]

  return { order, items }
}

export async function listOrders(query: ListOrdersQuery): Promise<SuccessListResponse<IOrder>> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const { bill_id, status } = query

  const filter: Record<string, unknown> = {}
  if (bill_id !== undefined) filter['bill_id'] = bill_id
  if (status !== undefined) filter['status'] = status

  const skip = (page - 1) * limit
  const [rawItems, total] = await Promise.all([
    OrderModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ])

  const items = rawItems as IOrder[]
  const totalPages = Math.ceil(total / limit)
  const pagination: Pagination = { page, limit, total, totalPages }

  return successList(items, pagination, 'Orders retrieved successfully')
}

export async function updateOrderItemStatus(
  input: UpdateOrderItemStatusInput,
): Promise<OrderWithItems> {
  if (!mongoose.Types.ObjectId.isValid(input.order_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const order = await OrderModel.findById(input.order_id)
  if (!order) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  if (!mongoose.Types.ObjectId.isValid(input.item_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order item not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const item = await OrderItemModel.findOne({ _id: input.item_id, order_id: input.order_id })
  if (!item) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order item not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  if (input.status === OrderItemStatus.CANCELLED && !input.reason) {
    throw problem({
      type: 'validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Reason is required when cancelling an order item.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const beforeStatus = item.status

  item.status = input.status
  if (input.status === OrderItemStatus.CANCELLED) {
    item.cancel_reason = input.reason ?? null
  }
  await item.save()

  if (input.status === OrderItemStatus.CANCELLED) {
    await createAuditLog({
      actor: input.actor,
      action: 'CANCEL_ORDER_ITEM',
      entity_name: 'OrderItem',
      entity_id: String(item._id),
      reason: input.reason ?? '',
      before_state: { status: beforeStatus },
      after_state: { status: OrderItemStatus.CANCELLED },
    })
  }

  const allItems = (await OrderItemModel.find({ order_id: order._id }).lean()) as IOrderItem[]
  const allCancelled = allItems.every((i) => i.status === OrderItemStatus.CANCELLED)
  const nonCancelled = allItems.filter((i) => i.status !== OrderItemStatus.CANCELLED)
  const allNonCancelledCooked = nonCancelled.every((i) => i.status === OrderItemStatus.COOKED)

  if (allCancelled) {
    order.status = OrderStatus.CANCELLED
  } else if (nonCancelled.length > 0 && allNonCancelledCooked) {
    order.status = OrderStatus.COOKED
  }
  await order.save()

  await recalculateBillTotal(String(order.bill_id))

  const orderChannel = `order:${input.order_id}`
  io.to('orders').emit('message', JSON.stringify({
    event: WS_EVENTS.ORDER_ITEM_STATUS_UPDATED,
    channel: 'orders',
    data: { order_id: input.order_id, item_id: input.item_id, status: input.status },
    timestamp: new Date().toISOString(),
  }))
  io.to(orderChannel).emit('message', JSON.stringify({
    event: WS_EVENTS.ORDER_ITEM_STATUS_UPDATED,
    channel: orderChannel,
    data: { order_id: input.order_id, item_id: input.item_id, status: input.status },
    timestamp: new Date().toISOString(),
  }))
  io.to('kitchen').emit('message', JSON.stringify({
    event: WS_EVENTS.ORDER_ITEM_STATUS_UPDATED,
    channel: 'kitchen',
    data: { order_id: input.order_id, item_id: input.item_id, status: input.status },
    timestamp: new Date().toISOString(),
  }))

  if (order.status === OrderStatus.COOKED || order.status === OrderStatus.CANCELLED) {
    io.to('orders').emit('message', JSON.stringify({
      event: WS_EVENTS.ORDER_STATUS_UPDATED,
      channel: 'orders',
      data: { order_id: input.order_id, status: order.status },
      timestamp: new Date().toISOString(),
    }))
    io.to(orderChannel).emit('message', JSON.stringify({
      event: WS_EVENTS.ORDER_STATUS_UPDATED,
      channel: orderChannel,
      data: { order_id: input.order_id, status: order.status },
      timestamp: new Date().toISOString(),
    }))
    io.to('kitchen').emit('message', JSON.stringify({
      event: WS_EVENTS.ORDER_STATUS_UPDATED,
      channel: 'kitchen',
      data: { order_id: input.order_id, status: order.status },
      timestamp: new Date().toISOString(),
    }))
  }

  logger.info('Order item status updated', {
    orderId: input.order_id,
    itemId: input.item_id,
    status: input.status,
  })

  const updatedItems = (await OrderItemModel.find({ order_id: order._id }).lean()) as IOrderItem[]

  return { order, items: updatedItems }
}

export async function updateOrderItemQuantity(
  input: UpdateOrderItemQuantityInput,
): Promise<OrderWithItems> {
  if (!mongoose.Types.ObjectId.isValid(input.order_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const order = await OrderModel.findById(input.order_id)
  if (!order) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  if (!mongoose.Types.ObjectId.isValid(input.item_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order item not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const item = await OrderItemModel.findOne({ _id: input.item_id, order_id: input.order_id })
  if (!item) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Order item not found.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  if (item.status === OrderItemStatus.CANCELLED) {
    throw problem({
      type: 'ORDER_ITEM_ALREADY_CANCELLED',
      title: 'Conflict',
      status: 409,
      detail: 'Cannot update quantity of a cancelled order item.',
      instance: `/v1/orders/${input.order_id}/items/${input.item_id}`,
    })
  }

  const oldQuantity = item.quantity
  item.quantity = input.quantity
  item.quantity_change_reason = input.reason
  await item.save()

  await createAuditLog({
    actor: input.actor,
    action: 'UPDATE_ORDER_ITEM_QUANTITY',
    entity_name: 'OrderItem',
    entity_id: String(item._id),
    reason: input.reason,
    before_state: { quantity: oldQuantity },
    after_state: { quantity: input.quantity },
  })

  await recalculateBillTotal(String(order.bill_id))

  logger.info('Order item quantity updated', {
    orderId: input.order_id,
    itemId: input.item_id,
    quantity: input.quantity,
  })

  const updatedItems = (await OrderItemModel.find({ order_id: order._id }).lean()) as IOrderItem[]

  return { order, items: updatedItems }
}
