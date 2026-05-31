import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as BillService from '@/services/bill.service.js'

// ─── Mongoose mock (counter + session) ───────────────────────────────────────
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
          findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'bill', seq: 1 }),
        }),
      },
      startSession: jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        abortTransaction: jest.fn().mockResolvedValue(undefined),
        endSession: jest.fn(),
      }),
    },
    Types,
  }
})

// ─── Model mocks ──────────────────────────────────────────────────────────────

jest.unstable_mockModule('@/models/bill.model.js', () => ({
  BillModel: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/table.model.js', () => ({
  TableModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/order.model.js', () => ({
  OrderModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/order-item.model.js', () => ({
  OrderItemModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/models/payment.model.js', () => ({
  PaymentModel: { find: jest.fn() },
}))

jest.unstable_mockModule('@/services/audit-log.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts })),
}))

// ─── Let declarations ─────────────────────────────────────────────────────────

let createBill: typeof BillService.createBill
let getBillById: typeof BillService.getBillById
let listBills: typeof BillService.listBills
let cancelBill: typeof BillService.cancelBill
let splitBill: typeof BillService.splitBill

let mockBillFindById: jest.Mock
let mockBillFind: jest.Mock
let mockBillCountDocuments: jest.Mock
let mockBillCreate: jest.Mock
let mockTableFindById: jest.Mock
let mockTableFindByIdAndUpdate: jest.Mock
let mockOrderFind: jest.Mock
let mockOrderItemFind: jest.Mock
let mockPaymentFind: jest.Mock
let mockCreateAuditLog: jest.Mock
let mockCounterFindOneAndUpdate: jest.Mock
let mockStartSession: jest.Mock
let mockSession: {
  startTransaction: jest.Mock
  commitTransaction: jest.Mock
  abortTransaction: jest.Mock
  endSession: jest.Mock
}

// listBills chain: find().sort().skip().limit().lean()
let mockSort: jest.Mock
let mockSkip: jest.Mock
let mockLimit: jest.Mock
let mockLean: jest.Mock

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const mongooseMod = await import('mongoose')
  const billModelMod = await import('@/models/bill.model.js')
  const tableModelMod = await import('@/models/table.model.js')
  const orderModelMod = await import('@/models/order.model.js')
  const orderItemModelMod = await import('@/models/order-item.model.js')
  const paymentModelMod = await import('@/models/payment.model.js')
  const auditLogMod = await import('@/services/audit-log.service.js')
  const serviceMod = await import('@/services/bill.service.js')

  // Extract mongoose mock internals
  const mockMongoose = (mongooseMod as { default: { connection: { collection: jest.Mock }; startSession: jest.Mock } }).default
  mockStartSession = mockMongoose.startSession as jest.Mock
  const collectionObj = (mockMongoose.connection.collection as jest.Mock)('counters') as { findOneAndUpdate: jest.Mock }
  mockCounterFindOneAndUpdate = collectionObj.findOneAndUpdate
  mockSession = (await mockStartSession()) as typeof mockSession

  const BillModel = billModelMod.BillModel as {
    find: jest.Mock; findById: jest.Mock; countDocuments: jest.Mock; create: jest.Mock
  }
  const TableModel = tableModelMod.TableModel as { findById: jest.Mock; findByIdAndUpdate: jest.Mock }
  const OrderModel = orderModelMod.OrderModel as { find: jest.Mock }
  const OrderItemModel = orderItemModelMod.OrderItemModel as { find: jest.Mock }
  const PaymentModel = paymentModelMod.PaymentModel as { find: jest.Mock }

  mockBillFindById = BillModel.findById
  mockBillFind = BillModel.find
  mockBillCountDocuments = BillModel.countDocuments
  mockBillCreate = BillModel.create
  mockTableFindById = TableModel.findById
  mockTableFindByIdAndUpdate = TableModel.findByIdAndUpdate
  mockOrderFind = OrderModel.find
  mockOrderItemFind = OrderItemModel.find
  mockPaymentFind = PaymentModel.find
  mockCreateAuditLog = auditLogMod.createAuditLog as jest.Mock

  mockLean = jest.fn()
  mockLimit = jest.fn().mockReturnValue({ lean: mockLean })
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })
  mockSort = jest.fn().mockReturnValue({ skip: mockSkip })

  createBill = serviceMod.createBill
  getBillById = serviceMod.getBillById
  listBills = serviceMod.listBills
  cancelBill = serviceMod.cancelBill
  splitBill = serviceMod.splitBill
})

beforeEach(() => {
  jest.clearAllMocks()
  mockLean.mockResolvedValue([])
  mockLimit.mockReturnValue({ lean: mockLean })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockSort.mockReturnValue({ skip: mockSkip })
  mockBillFind.mockReturnValue({ sort: mockSort })
  mockCounterFindOneAndUpdate.mockResolvedValue({ _id: 'bill', seq: 1 })
  mockStartSession.mockResolvedValue(mockSession)
  mockSession.commitTransaction.mockResolvedValue(undefined)
  mockSession.abortTransaction.mockResolvedValue(undefined)
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const billId = '64f1a2b3c4d5e6f7a8b9c001'
const tableId = '64f1a2b3c4d5e6f7a8b9c002'
const orderId = '64f1a2b3c4d5e6f7a8b9c003'
const item1Id = '64f1a2b3c4d5e6f7a8b9c004'
const item2Id = '64f1a2b3c4d5e6f7a8b9c005'
const item3Id = '64f1a2b3c4d5e6f7a8b9c006'
const userId = '64f1a2b3c4d5e6f7a8b9c009'

const mockBillDoc = {
  _id: billId,
  short_id: 'B-0001',
  name: 'บิลโต๊ะ 5',
  table_id: tableId,
  status: 'OPEN',
  total_amount: 560,
  cancel_reason: null,
  save: jest.fn().mockResolvedValue(undefined),
}

const actor = { id: userId, username: 'cashier01', role: 'CASHIER' }

// ─── createBill() ─────────────────────────────────────────────────────────────

describe('createBill()', () => {
  const input = { table_id: tableId, name: 'บิลโต๊ะ 5', created_by: userId }

  it('creates bill when table is OCCUPIED', async () => {
    const tableDoc = { _id: tableId, table_name: 'โต๊ะ 5', status: 'OCCUPIED', bill_ids: [], save: jest.fn() }
    mockTableFindById.mockResolvedValue(tableDoc)
    mockBillCreate.mockResolvedValue({
      _id: billId, short_id: 'B-0001', name: input.name, status: 'OPEN', total_amount: 0,
    })

    const result = await createBill(input)

    expect(result.short_id).toBe('B-0001')
    expect(result.status).toBe('OPEN')
    expect(tableDoc.bill_ids).toContain(billId)
    expect(tableDoc.save).toHaveBeenCalled()
  })

  it('sets table to OCCUPIED when table is PAID', async () => {
    const tableDoc = { _id: tableId, table_name: 'โต๊ะ 5', status: 'PAID', bill_ids: [], save: jest.fn() }
    mockTableFindById.mockResolvedValue(tableDoc)
    mockBillCreate.mockResolvedValue({ _id: billId, short_id: 'B-0001', status: 'OPEN', total_amount: 0 })

    await createBill(input)

    expect(tableDoc.status).toBe('OCCUPIED')
    expect(tableDoc.bill_ids).toContain(billId)
    expect(tableDoc.save).toHaveBeenCalled()
  })

  it('throws 404 when table not found', async () => {
    mockTableFindById.mockResolvedValue(null)

    await expect(createBill(input)).rejects.toMatchObject({ status: 404 })
    expect(mockBillCreate).not.toHaveBeenCalled()
  })

  it('throws 409 when table is AVAILABLE', async () => {
    mockTableFindById.mockResolvedValue({ status: 'AVAILABLE', save: jest.fn() })

    await expect(createBill(input)).rejects.toMatchObject({ status: 409, type: 'TABLE_NOT_OCCUPIED' })
    expect(mockBillCreate).not.toHaveBeenCalled()
  })

  it('throws 409 when table is RESERVED', async () => {
    mockTableFindById.mockResolvedValue({ status: 'RESERVED', save: jest.fn() })

    await expect(createBill(input)).rejects.toMatchObject({ status: 409, type: 'TABLE_NOT_OCCUPIED' })
    expect(mockBillCreate).not.toHaveBeenCalled()
  })
})

// ─── getBillById() ────────────────────────────────────────────────────────────

describe('getBillById()', () => {
  it('returns bill with table, orders, and payments embedded', async () => {
    const mockTableDoc = { _id: tableId, table_name: 'โต๊ะ 5', status: 'OCCUPIED' }
    const mockOrder = { _id: orderId, bill_id: billId, status: 'SENT_TO_KITCHEN' }
    const mockItems = [
      { _id: item1Id, order_id: orderId, unit_price: 200, quantity: 1, status: null },
      { _id: item2Id, order_id: orderId, unit_price: 360, quantity: 1, status: null },
    ]
    const mockPayment = { _id: '64f1a2b3c4d5e6f7a8b9c007', bill_id: billId, amount: 560 }

    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBillDoc) })
    mockTableFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTableDoc) })
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockOrder]) })
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItems) })
    mockPaymentFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockPayment]) })

    const result = await getBillById(billId)

    expect(result.bill).toEqual(mockBillDoc)
    expect(result.table?.table_name).toBe('โต๊ะ 5')
    expect(result.orders).toHaveLength(1)
    expect(result.orders[0]?.items).toHaveLength(2)
    expect(result.payments).toHaveLength(1)
  })

  it('throws 404 when bill not found', async () => {
    mockBillFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(getBillById(billId)).rejects.toMatchObject({ status: 404 })
  })
})

// ─── cancelBill() ─────────────────────────────────────────────────────────────

describe('cancelBill()', () => {
  it('cancels OPEN bill and clears table when no other bills remain', async () => {
    const billDoc = { ...mockBillDoc, status: 'OPEN', save: jest.fn().mockResolvedValue(undefined) }
    mockBillFindById.mockResolvedValue(billDoc)
    mockBillCountDocuments.mockResolvedValue(0)
    mockTableFindByIdAndUpdate.mockResolvedValue({})

    await cancelBill({ id: billId, reason: 'Customer left', actor })

    expect(billDoc.status).toBe('CANCELLED')
    expect(billDoc.cancel_reason).toBe('Customer left')
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(tableId, { status: 'AVAILABLE' })
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CANCEL_BILL' }),
    )
  })

  it('does NOT clear table when other OPEN bills remain', async () => {
    const billDoc = { ...mockBillDoc, status: 'OPEN', save: jest.fn().mockResolvedValue(undefined) }
    mockBillFindById.mockResolvedValue(billDoc)
    mockBillCountDocuments.mockResolvedValue(1)

    await cancelBill({ id: billId, reason: 'Customer left', actor })

    expect(mockTableFindByIdAndUpdate).not.toHaveBeenCalled()
  })

  it('throws 404 when bill not found', async () => {
    mockBillFindById.mockResolvedValue(null)

    await expect(cancelBill({ id: billId, reason: 'reason', actor })).rejects.toMatchObject({
      status: 404,
    })
  })

  it('throws 409 when bill is already PAID', async () => {
    mockBillFindById.mockResolvedValue({ ...mockBillDoc, status: 'PAID', save: jest.fn() })

    await expect(cancelBill({ id: billId, reason: 'reason', actor })).rejects.toMatchObject({
      status: 409,
      type: 'BILL_NOT_OPEN',
    })
  })

  it('throws 409 when bill is already CANCELLED', async () => {
    mockBillFindById.mockResolvedValue({ ...mockBillDoc, status: 'CANCELLED', save: jest.fn() })

    await expect(cancelBill({ id: billId, reason: 'reason', actor })).rejects.toMatchObject({
      status: 409,
      type: 'BILL_NOT_OPEN',
    })
  })
})

// ─── splitBill() ──────────────────────────────────────────────────────────────

describe('splitBill()', () => {
  const mockOrder = { _id: orderId }
  const activeItems = [
    { _id: item1Id, status: null, unit_price: 200, quantity: 1 },
    { _id: item2Id, status: null, unit_price: 360, quantity: 1 },
  ]

  it('splits OPEN bill into sub-bills', async () => {
    const parentBillDoc = {
      ...mockBillDoc,
      status: 'OPEN',
      save: jest.fn().mockResolvedValue(undefined),
    }
    mockBillFindById.mockResolvedValue(parentBillDoc)
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockOrder]) })
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(activeItems) })
    mockBillCreate.mockImplementation(async (docs: unknown[]) => docs)

    const result = await splitBill({
      id: billId,
      bills: [
        { label: 'A', item_ids: [item1Id] },
        { label: 'B', item_ids: [item2Id] },
      ],
      actor,
    })

    expect(result.sub_bills).toHaveLength(2)
    expect(result.sub_bills[0]?.short_id).toBe('B-0001/A')
    expect(result.sub_bills[1]?.short_id).toBe('B-0001/B')
    expect(parentBillDoc.status).toBe('CANCELLED')
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'SPLIT_BILL' }),
    )
  })

  it('throws 409 when parent bill is not OPEN', async () => {
    mockBillFindById.mockResolvedValue({ ...mockBillDoc, status: 'PAID', save: jest.fn() })

    await expect(
      splitBill({
        id: billId,
        bills: [
          { label: 'A', item_ids: [item1Id] },
          { label: 'B', item_ids: [item2Id] },
        ],
        actor,
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('throws 400 when an active item is not assigned to any sub-bill', async () => {
    const threeItems = [
      ...activeItems,
      { _id: item3Id, status: null, unit_price: 100, quantity: 1 },
    ]
    mockBillFindById.mockResolvedValue({ ...mockBillDoc, status: 'OPEN', save: jest.fn() })
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockOrder]) })
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(threeItems) })

    await expect(
      splitBill({
        id: billId,
        bills: [
          { label: 'A', item_ids: [item1Id] },
          { label: 'B', item_ids: [item2Id] },
        ],
        actor,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('throws 400 when an item appears in more than one sub-bill', async () => {
    mockBillFindById.mockResolvedValue({ ...mockBillDoc, status: 'OPEN', save: jest.fn() })
    mockOrderFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockOrder]) })
    mockOrderItemFind.mockReturnValue({ lean: jest.fn().mockResolvedValue(activeItems) })

    await expect(
      splitBill({
        id: billId,
        bills: [
          { label: 'A', item_ids: [item1Id] },
          { label: 'B', item_ids: [item1Id, item2Id] },
        ],
        actor,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
