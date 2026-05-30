import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as PaymentService from '@/services/payment.service.js'

// ─── Model mocks ──────────────────────────────────────────────────────────────
// Use relative paths — jest.unstable_mockModule resolves them to absolute file
// paths that match what the @/ alias imports in the service resolve to.

jest.unstable_mockModule('../../../src/models/payment.model.js', () => ({
  PaymentModel: {
    findById: jest.fn(),
    create: jest.fn(),
  },
}))

jest.unstable_mockModule('../../../src/models/bill.model.js', () => ({
  BillModel: {
    findById: jest.fn(),
  },
}))

jest.unstable_mockModule('../../../src/models/table.model.js', () => ({
  TableModel: {
    findById: jest.fn(),
  },
}))

jest.unstable_mockModule('../../../src/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts })),
}))

// ─── Let declarations ─────────────────────────────────────────────────────────

let createPayment: typeof PaymentService.createPayment
let getPaymentById: typeof PaymentService.getPaymentById

let mockPaymentFindById: jest.Mock
let mockPaymentCreate: jest.Mock
let mockBillFindById: jest.Mock
let mockTableFindById: jest.Mock

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const paymentModelMod = await import('../../../src/models/payment.model.js')
  const billModelMod = await import('../../../src/models/bill.model.js')
  const tableModelMod = await import('../../../src/models/table.model.js')
  const serviceMod = await import('@/services/payment.service.js')

  const PaymentModel = paymentModelMod.PaymentModel as { findById: jest.Mock; create: jest.Mock }
  const BillModel = billModelMod.BillModel as { findById: jest.Mock }
  const TableModel = tableModelMod.TableModel as { findById: jest.Mock }

  mockPaymentFindById = PaymentModel.findById
  mockPaymentCreate = PaymentModel.create
  mockBillFindById = BillModel.findById
  mockTableFindById = TableModel.findById

  createPayment = serviceMod.createPayment
  getPaymentById = serviceMod.getPaymentById
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Fixture factories ────────────────────────────────────────────────────────
// Real mongoose Types.ObjectId.isValid() is used — inputs must be valid 24-char
// hex strings so that the ObjectId guard in the service passes.

const BILL_ID = '64f1a2b3c4d5e6f7a8b9c001'
const TABLE_ID = '64f1a2b3c4d5e6f7a8b9c002'
const PAY_ID = '64f1a2b3c4d5e6f7a8b9c003'
const USER_ID = '64f1a2b3c4d5e6f7a8b9c009'

function makeBill(overrides: Record<string, unknown> = {}) {
  return {
    _id: BILL_ID,
    table_id: TABLE_ID,
    status: 'OPEN',
    total_amount: 560,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeTable(overrides: Record<string, unknown> = {}) {
  return {
    _id: TABLE_ID,
    status: 'OCCUPIED',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

// ─── createPayment() — CASH ───────────────────────────────────────────────────

describe('createPayment() — CASH', () => {
  it('processes CASH payment and transitions bill and table to PAID', async () => {
    const bill = makeBill()
    const table = makeTable()

    mockBillFindById.mockResolvedValue(bill)
    mockTableFindById.mockResolvedValue(table)
    mockPaymentCreate.mockResolvedValue({
      _id: PAY_ID,
      bill_id: BILL_ID,
      method: 'CASH',
      amount: 560,
      cash: { amount: 560, received_amount: 600, change_amount: 40 },
      qr_promptpay: null,
    })

    const result = await createPayment({
      bill_id: BILL_ID,
      method: 'CASH' as any,
      amount: 560,
      cash: { received_amount: 600 },
      confirmed_by: USER_ID,
    })

    expect(result.payment.method).toBe('CASH')
    expect((result.payment.cash as { change_amount: number }).change_amount).toBe(40)
    expect(bill.status).toBe('PAID')
    expect(bill.save).toHaveBeenCalled()
    expect(table.status).toBe('PAID')
    expect(table.save).toHaveBeenCalled()
  })

  it('throws 400 when received_amount is less than bill total', async () => {
    mockBillFindById.mockResolvedValue(makeBill())

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'CASH' as any,
        amount: 560,
        cash: { received_amount: 500 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 400, type: 'INSUFFICIENT_CASH' })
  })

  it('calculates change_amount correctly', async () => {
    const bill = makeBill()
    const table = makeTable()
    mockBillFindById.mockResolvedValue(bill)
    mockTableFindById.mockResolvedValue(table)
    mockPaymentCreate.mockResolvedValue({
      _id: PAY_ID,
      method: 'CASH',
      amount: 560,
      cash: { amount: 560, received_amount: 1000, change_amount: 440 },
      qr_promptpay: null,
    })

    await createPayment({
      bill_id: BILL_ID,
      method: 'CASH' as any,
      amount: 560,
      cash: { received_amount: 1000 },
      confirmed_by: USER_ID,
    })

    expect(mockPaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        cash: expect.objectContaining({ change_amount: 440 }),
      }),
    )
  })
})

// ─── createPayment() — QR_PROMPTPAY ──────────────────────────────────────────

describe('createPayment() — QR_PROMPTPAY', () => {
  it('processes QR payment and transitions bill and table to PAID', async () => {
    const bill = makeBill()
    const table = makeTable()
    mockBillFindById.mockResolvedValue(bill)
    mockTableFindById.mockResolvedValue(table)
    mockPaymentCreate.mockResolvedValue({
      _id: PAY_ID,
      bill_id: BILL_ID,
      method: 'QR_PROMPTPAY',
      amount: 560,
      cash: null,
      qr_promptpay: { amount: 560, received_amount: 560, change_amount: 0 },
    })

    const result = await createPayment({
      bill_id: BILL_ID,
      method: 'QR_PROMPTPAY' as any,
      amount: 560,
      qr_promptpay: { received_amount: 560 },
      confirmed_by: USER_ID,
    })

    expect(result.payment.method).toBe('QR_PROMPTPAY')
    expect((result.payment.qr_promptpay as { change_amount: number }).change_amount).toBe(0)
    expect(result.payment.cash).toBeNull()
    expect(bill.status).toBe('PAID')
    expect(table.status).toBe('PAID')
  })
})

// ─── createPayment() — MIXED ──────────────────────────────────────────────────

describe('createPayment() — MIXED', () => {
  it('processes MIXED payment when portions sum to bill total', async () => {
    const bill = makeBill({ total_amount: 560 })
    const table = makeTable()
    mockBillFindById.mockResolvedValue(bill)
    mockTableFindById.mockResolvedValue(table)
    mockPaymentCreate.mockResolvedValue({
      _id: PAY_ID,
      method: 'MIXED',
      amount: 560,
      cash: { amount: 200, received_amount: 200, change_amount: 0 },
      qr_promptpay: { amount: 360, received_amount: 360, change_amount: 0 },
    })

    const result = await createPayment({
      bill_id: BILL_ID,
      method: 'MIXED' as any,
      amount: 560,
      cash: { received_amount: 200 },
      qr_promptpay: { received_amount: 360 },
      confirmed_by: USER_ID,
    })

    expect((result.payment.cash as { amount: number }).amount).toBe(200)
    expect((result.payment.qr_promptpay as { amount: number }).amount).toBe(360)
    expect(bill.status).toBe('PAID')
    expect(table.status).toBe('PAID')
  })

  it('throws 400 when cash + qr does not equal bill total', async () => {
    mockBillFindById.mockResolvedValue(makeBill())

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'MIXED' as any,
        amount: 560,
        cash: { received_amount: 200 },
        qr_promptpay: { received_amount: 300 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 400, type: 'MIXED_AMOUNT_MISMATCH' })
  })

  it('throws 400 when portions are insufficient and do not sum to bill total', async () => {
    mockBillFindById.mockResolvedValue(makeBill())

    // cash=150, qr=360 → sum 510 ≠ 560 → MIXED_AMOUNT_MISMATCH
    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'MIXED' as any,
        amount: 560,
        cash: { received_amount: 150 },
        qr_promptpay: { received_amount: 360 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 400, type: 'MIXED_AMOUNT_MISMATCH' })
  })
})

// ─── createPayment() — business rule guards ───────────────────────────────────

describe('createPayment() — BR-P02 and status guards', () => {
  it('throws 400 when amount does not equal bill total_amount', async () => {
    mockBillFindById.mockResolvedValue(makeBill({ total_amount: 560 }))

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'CASH' as any,
        amount: 500,
        cash: { received_amount: 500 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 400, type: 'PAYMENT_AMOUNT_MISMATCH' })
  })

  it('throws 409 when bill is already PAID', async () => {
    mockBillFindById.mockResolvedValue(makeBill({ status: 'PAID' }))

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'CASH' as any,
        amount: 560,
        cash: { received_amount: 560 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 409, type: 'BILL_ALREADY_PAID' })
  })

  it('throws 409 when bill is CANCELLED', async () => {
    mockBillFindById.mockResolvedValue(makeBill({ status: 'CANCELLED' }))

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'CASH' as any,
        amount: 560,
        cash: { received_amount: 560 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 409, type: 'BILL_CANCELLED' })
  })

  it('throws 404 when bill not found', async () => {
    mockBillFindById.mockResolvedValue(null)

    await expect(
      createPayment({
        bill_id: BILL_ID,
        method: 'CASH' as any,
        amount: 560,
        cash: { received_amount: 560 },
        confirmed_by: USER_ID,
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})

// ─── getPaymentById() ─────────────────────────────────────────────────────────

describe('getPaymentById()', () => {
  it('returns payment by id', async () => {
    mockPaymentFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: PAY_ID, method: 'CASH', amount: 560 }),
    })

    const result = await getPaymentById(PAY_ID)

    expect(result._id).toBe(PAY_ID)
  })

  it('throws 404 when payment not found', async () => {
    mockPaymentFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    })

    await expect(getPaymentById(PAY_ID)).rejects.toMatchObject({ status: 404 })
  })
})
