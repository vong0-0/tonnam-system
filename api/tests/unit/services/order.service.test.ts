import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as OrderService from '@/services/order.service.js'
import { OrderItemStatus } from '@/types/index.js'

// ─── Mongoose mock (counter) ──────────────────────────────────────────────────
// All jest.fn() calls live inside the factory — no module-scope jest.fn() before mocks

jest.unstable_mockModule('mongoose', () => {
  class MockObjectId {
    private _id: string
    constructor(id = '000000000000000000000000') {
      this._id = String(id)
    }
    toString() {
      return this._id
    }
    static isValid(id: unknown): boolean {
      return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)
    }
  }
  const Types = { ObjectId: MockObjectId }
  return {
    default: {
      Types,
      connection: {
        collection: jest.fn().mockReturnValue({
          findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'order', seq: 1 }),
        }),
      },
    },
    Types,
  }
})

// ─── Model mocks ──────────────────────────────────────────────────────────────

jest.unstable_mockModule('@/models/order.model.js', () => ({
  OrderModel: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/order-item.model.js', () => ({
  OrderItemModel: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertMany: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/bill.model.js', () => ({
  BillModel: {
    findById: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/menu-item.model.js', () => ({
  MenuItemModel: {
    findById: jest.fn(),
  },
}))

// ─── Service mocks ────────────────────────────────────────────────────────────

jest.unstable_mockModule('@/services/audit-log.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}))

jest.unstable_mockModule('@/services/bill.service.js', () => ({
  recalculateBillTotal: jest.fn().mockResolvedValue(undefined),
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts })),
}))

// ─── Let declarations ─────────────────────────────────────────────────────────

let createOrder: typeof OrderService.createOrder
let getOrderById: typeof OrderService.getOrderById
let listOrders: typeof OrderService.listOrders
let updateOrderItemStatus: typeof OrderService.updateOrderItemStatus

let mockOrderFind: jest.Mock
let mockOrderFindById: jest.Mock
let mockOrderCreate: jest.Mock
let mockOrderItemFind: jest.Mock
let mockOrderItemFindOne: jest.Mock
let mockOrderItemInsertMany: jest.Mock
let mockBillFindById: jest.Mock
let mockMenuItemFindById: jest.Mock
let mockCreateAuditLog: jest.Mock
let mockRecalculateBillTotal: jest.Mock
let mockCounterFindOneAndUpdate: jest.Mock

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const mongooseMod = await import('mongoose')
  const orderModelMod = await import('@/models/order.model.js')
  const orderItemModelMod = await import('@/models/order-item.model.js')
  const billModelMod = await import('@/models/bill.model.js')
  const menuItemModelMod = await import('@/models/menu-item.model.js')
  const auditLogMod = await import('@/services/audit-log.service.js')
  const billServiceMod = await import('@/services/bill.service.js')
  const serviceMod = await import('@/services/order.service.js')

  const mockMongoose = (
    mongooseMod as { default: { connection: { collection: jest.Mock } } }
  ).default
  const collectionObj = (mockMongoose.connection.collection as jest.Mock)('counters') as {
    findOneAndUpdate: jest.Mock
  }
  mockCounterFindOneAndUpdate = collectionObj.findOneAndUpdate

  const OrderModel = orderModelMod.OrderModel as {
    find: jest.Mock
    findById: jest.Mock
    create: jest.Mock
    countDocuments: jest.Mock
  }
  const OrderItemModel = orderItemModelMod.OrderItemModel as {
    find: jest.Mock
    findOne: jest.Mock
    insertMany: jest.Mock
  }
  const BillModel = billModelMod.BillModel as { findById: jest.Mock }
  const MenuItemModel = menuItemModelMod.MenuItemModel as { findById: jest.Mock }

  mockOrderFind = OrderModel.find
  mockOrderFindById = OrderModel.findById
  mockOrderCreate = OrderModel.create
  mockOrderItemFind = OrderItemModel.find
  mockOrderItemFindOne = OrderItemModel.findOne
  mockOrderItemInsertMany = OrderItemModel.insertMany
  mockBillFindById = BillModel.findById
  mockMenuItemFindById = MenuItemModel.findById
  mockCreateAuditLog = auditLogMod.createAuditLog as jest.Mock
  mockRecalculateBillTotal = billServiceMod.recalculateBillTotal as jest.Mock

  createOrder = serviceMod.createOrder
  getOrderById = serviceMod.getOrderById
  listOrders = serviceMod.listOrders
  updateOrderItemStatus = serviceMod.updateOrderItemStatus
})

beforeEach(() => {
  jest.clearAllMocks()
  mockCounterFindOneAndUpdate.mockResolvedValue({ _id: 'order', seq: 1 })
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const orderId = '64f1a2b3c4d5e6f7a8b9c001'
const billId = '64f1a2b3c4d5e6f7a8b9c002'
const menuItemId = '64f1a2b3c4d5e6f7a8b9c003'
const itemId = '64f1a2b3c4d5e6f7a8b9c004'
const item2Id = '64f1a2b3c4d5e6f7a8b9c005'
const userId = '64f1a2b3c4d5e6f7a8b9c009'

const actor = { id: userId, username: 'kitchen01', role: 'KITCHEN' }

// ─── createOrder() ────────────────────────────────────────────────────────────

describe('createOrder()', () => {
  const mockBill = { _id: billId, status: 'OPEN' }

  const mockMenuItem = {
    _id: menuItemId,
    name: 'ต้มยำกุ้ง',
    price: 280,
    is_available: true,
  }

  const input = {
    bill_id: billId,
    created_by: userId,
    items: [{ menu_item_id: menuItemId, quantity: 2, note: 'ไม่เผ็ด' }],
  }

  it('creates order with items and recalculates bill total', async () => {
    const mockOrderDoc = {
      _id: orderId,
      short_id: 'O-0001',
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
    }
    const mockItems = [
      {
        _id: itemId,
        order_id: orderId,
        menu_item_id: menuItemId,
        quantity: 2,
        unit_price: 280,
        note: 'ไม่เผ็ด',
        status: null,
      },
    ]

    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBill) })
    mockMenuItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockMenuItem) })
    mockOrderCreate.mockResolvedValue(mockOrderDoc)
    mockOrderItemInsertMany.mockResolvedValue(mockItems)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItems) })

    const result = await createOrder(input)

    expect(result.order.status).toBe('SENT_TO_KITCHEN')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.unit_price).toBe(280)
    expect(mockRecalculateBillTotal).toHaveBeenCalledWith(billId)
  })

  it('throws 404 when bill not found', async () => {
    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(createOrder(input)).rejects.toMatchObject({ status: 404 })
  })

  it('throws 409 when bill is not OPEN', async () => {
    mockBillFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockBill, status: 'PAID' }),
    })

    await expect(createOrder(input)).rejects.toMatchObject({ status: 409, type: 'BILL_NOT_OPEN' })
  })

  it('throws 404 when menu item not found', async () => {
    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBill) })
    mockMenuItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(createOrder(input)).rejects.toMatchObject({ status: 404 })
  })

  it('throws 409 when menu item is not available', async () => {
    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBill) })
    mockMenuItemFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockMenuItem, is_available: false }),
    })

    await expect(createOrder(input)).rejects.toMatchObject({
      status: 409,
      type: 'MENU_ITEM_NOT_AVAILABLE',
    })
  })

  it('captures unit_price from menu item at time of order', async () => {
    const expensiveMenuItem = { ...mockMenuItem, price: 350 }
    const mockOrderDoc = {
      _id: orderId,
      short_id: 'O-0001',
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
    }

    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBill) })
    mockMenuItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(expensiveMenuItem) })
    mockOrderCreate.mockResolvedValue(mockOrderDoc)
    mockOrderItemInsertMany.mockResolvedValue([])
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

    await createOrder({ ...input, items: [{ menu_item_id: menuItemId, quantity: 1 }] })

    expect(mockOrderItemInsertMany).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ unit_price: 350 })]),
    )
  })
})

// ─── getOrderById() ───────────────────────────────────────────────────────────

describe('getOrderById()', () => {
  it('returns order with items embedded', async () => {
    const mockOrderDoc = { _id: orderId, bill_id: billId }
    const mockItems = [
      { _id: itemId, order_id: orderId, unit_price: 200 },
      { _id: item2Id, order_id: orderId, unit_price: 360 },
    ]

    mockOrderFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockOrderDoc) })
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItems) })

    const result = await getOrderById(orderId)

    expect(result.order).toEqual(mockOrderDoc)
    expect(result.items).toHaveLength(2)
  })

  it('throws 404 when order not found', async () => {
    mockOrderFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(getOrderById(orderId)).rejects.toMatchObject({ status: 404 })
  })
})

// ─── updateOrderItemStatus() ──────────────────────────────────────────────────

describe('updateOrderItemStatus()', () => {
  it('marks item COOKED and keeps order SENT_TO_KITCHEN when other items pending', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    }
    const allItems = [
      { _id: itemId, status: 'COOKED' },
      { _id: item2Id, status: null },
    ]

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(allItems) })

    await updateOrderItemStatus({
      order_id: orderId,
      item_id: itemId,
      status: OrderItemStatus.COOKED,
      actor,
    })

    expect(mockItem.status).toBe('COOKED')
    expect(mockOrder.status).toBe('SENT_TO_KITCHEN')
    expect(mockRecalculateBillTotal).toHaveBeenCalledWith(billId)
  })

  it('transitions order to COOKED when all items COOKED', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    }
    const allItems = [
      { _id: itemId, status: 'COOKED' },
      { _id: item2Id, status: 'COOKED' },
    ]

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(allItems) })

    await updateOrderItemStatus({
      order_id: orderId,
      item_id: itemId,
      status: OrderItemStatus.COOKED,
      actor,
    })

    expect(mockOrder.status).toBe('COOKED')
    expect(mockOrder.save).toHaveBeenCalled()
  })

  it('transitions order to CANCELLED when all items CANCELLED', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    }
    const allItems = [
      { _id: itemId, status: 'CANCELLED' },
      { _id: item2Id, status: 'CANCELLED' },
    ]

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(allItems) })

    await updateOrderItemStatus({
      order_id: orderId,
      item_id: itemId,
      status: OrderItemStatus.CANCELLED,
      reason: 'Customer changed mind',
      actor,
    })

    expect(mockOrder.status).toBe('CANCELLED')
  })

  it('transitions order to COOKED when mix of COOKED and CANCELLED', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    }
    const allItems = [
      { _id: itemId, status: 'COOKED' },
      { _id: item2Id, status: 'CANCELLED' },
    ]

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(allItems) })

    await updateOrderItemStatus({
      order_id: orderId,
      item_id: itemId,
      status: OrderItemStatus.COOKED,
      actor,
    })

    expect(mockOrder.status).toBe('COOKED')
  })

  it('creates audit log when item is CANCELLED', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: null as string | null,
      save: jest.fn().mockResolvedValue(undefined),
    }
    const allItems = [{ _id: itemId, status: 'CANCELLED' }]

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(allItems) })

    await updateOrderItemStatus({
      order_id: orderId,
      item_id: itemId,
      status: OrderItemStatus.CANCELLED,
      reason: 'ลูกค้าเปลี่ยนใจ',
      actor,
    })

    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CANCEL_ORDER_ITEM',
        reason: 'ลูกค้าเปลี่ยนใจ',
      }),
    )
  })

  it('throws 409 when item is already CANCELLED', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn(),
    }
    const mockItem = {
      _id: itemId,
      order_id: orderId,
      status: 'CANCELLED',
      save: jest.fn(),
    }

    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(mockItem)

    await expect(
      updateOrderItemStatus({
        order_id: orderId,
        item_id: itemId,
        status: OrderItemStatus.CANCELLED,
        reason: 'test',
        actor,
      }),
    ).rejects.toMatchObject({ status: 409, type: 'ORDER_ITEM_ALREADY_CANCELLED' })
  })

  it('throws 404 when order not found', async () => {
    mockOrderFindById.mockResolvedValue(null)

    await expect(
      updateOrderItemStatus({
        order_id: orderId,
        item_id: itemId,
        status: OrderItemStatus.COOKED,
        actor,
      }),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('throws 404 when item not found', async () => {
    const mockOrder = {
      _id: orderId,
      bill_id: billId,
      status: 'SENT_TO_KITCHEN',
      save: jest.fn(),
    }
    mockOrderFindById.mockResolvedValue(mockOrder)
    mockOrderItemFindOne.mockResolvedValue(null)

    await expect(
      updateOrderItemStatus({
        order_id: orderId,
        item_id: itemId,
        status: OrderItemStatus.COOKED,
        actor,
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
