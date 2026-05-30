import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as ReservationService from '@/services/reservation.service.js'

jest.unstable_mockModule('@/models/reservation.model.js', () => ({
  ReservationModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
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

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts, message: opts['detail'] })),
}))

let listReservations: typeof ReservationService.listReservations
let getReservationById: typeof ReservationService.getReservationById
let createReservation: typeof ReservationService.createReservation
let updateReservation: typeof ReservationService.updateReservation
let updateReservationStatus: typeof ReservationService.updateReservationStatus
let deleteReservation: typeof ReservationService.deleteReservation

let mockReservationFind: jest.Mock
let mockReservationFindById: jest.Mock
let mockReservationFindByIdAndUpdate: jest.Mock
let mockReservationFindByIdAndDelete: jest.Mock
let mockReservationCountDocuments: jest.Mock
let mockReservationCreate: jest.Mock
let mockTableFindById: jest.Mock
let mockTableFindByIdAndUpdate: jest.Mock

// find chain — set up in beforeAll, re-linked in beforeEach
let mockLean: jest.Mock
let mockLimit: jest.Mock
let mockSkip: jest.Mock

beforeAll(async () => {
  const reservationModelMod = await import('@/models/reservation.model.js')
  const tableModelMod = await import('@/models/table.model.js')
  const serviceMod = await import('@/services/reservation.service.js')

  const ReservationModel = reservationModelMod.ReservationModel as {
    find: jest.Mock
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
    findByIdAndDelete: jest.Mock
    countDocuments: jest.Mock
    create: jest.Mock
  }
  const TableModel = tableModelMod.TableModel as {
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
  }

  mockReservationFind = ReservationModel.find
  mockReservationFindById = ReservationModel.findById
  mockReservationFindByIdAndUpdate = ReservationModel.findByIdAndUpdate
  mockReservationFindByIdAndDelete = ReservationModel.findByIdAndDelete
  mockReservationCountDocuments = ReservationModel.countDocuments
  mockReservationCreate = ReservationModel.create
  mockTableFindById = TableModel.findById
  mockTableFindByIdAndUpdate = TableModel.findByIdAndUpdate

  mockLean = jest.fn()
  mockLimit = jest.fn().mockReturnValue({ lean: mockLean })
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })

  listReservations = serviceMod.listReservations
  getReservationById = serviceMod.getReservationById
  createReservation = serviceMod.createReservation
  updateReservation = serviceMod.updateReservation
  updateReservationStatus = serviceMod.updateReservationStatus
  deleteReservation = serviceMod.deleteReservation
})

beforeEach(() => {
  jest.clearAllMocks()
  mockReservationFind.mockReturnValue({ skip: mockSkip })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockLimit.mockReturnValue({ lean: mockLean })
})

const mockTable = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d2',
  table_name: 'T01',
  status: 'AVAILABLE',
  save: jest.fn().mockResolvedValue(undefined),
}

const mockReservation = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  table_id: '64f1a2b3c4d5e6f7a8b9c0d2',
  reserver_name: 'Wanchai Pongsakorn',
  phone: '02012345678',
  party_size: 4,
  reserved_at: new Date('2026-06-01T19:00:00Z'),
  status: 'PENDING',
  notes: null,
  created_by: '64f1a2b3c4d5e6f7a8b9c0d9',
  save: jest.fn().mockResolvedValue(undefined),
}

const createInput = {
  table_id: '64f1a2b3c4d5e6f7a8b9c0d2',
  reserver_name: 'Wanchai Pongsakorn',
  phone: '02012345678',
  party_size: 4,
  reserved_at: '2026-06-01T19:00:00Z',
  notes: null as string | null,
}

const reservationId = '64f1a2b3c4d5e6f7a8b9c0d1'

// ─── listReservations() ───────────────────────────────────────────────────────

describe('listReservations()', () => {
  it('returns paginated list with default page/limit', async () => {
    mockLean.mockResolvedValue([mockReservation])
    mockReservationCountDocuments.mockResolvedValue(1)

    const result = await listReservations({ page: 1, limit: 20 })

    expect(mockReservationFind).toHaveBeenCalledWith({})
    expect(mockSkip).toHaveBeenCalledWith(0)
    expect(mockLimit).toHaveBeenCalledWith(20)
    expect(result.data).toEqual([mockReservation])
  })

  it('filters by status when provided', async () => {
    mockLean.mockResolvedValue([mockReservation])
    mockReservationCountDocuments.mockResolvedValue(1)

    await listReservations({ page: 1, limit: 20, status: 'PENDING' })

    expect(mockReservationFind).toHaveBeenCalledWith({ status: 'PENDING' })
  })

  it('filters by table_id when provided', async () => {
    mockLean.mockResolvedValue([mockReservation])
    mockReservationCountDocuments.mockResolvedValue(1)

    await listReservations({ page: 1, limit: 20, table_id: '64f1a2b3c4d5e6f7a8b9c0d2' })

    expect(mockReservationFind).toHaveBeenCalledWith({ table_id: '64f1a2b3c4d5e6f7a8b9c0d2' })
  })

  it('filters by search (regex on reserver_name) when provided', async () => {
    mockLean.mockResolvedValue([mockReservation])
    mockReservationCountDocuments.mockResolvedValue(1)

    await listReservations({ page: 1, limit: 20, search: 'Wanchai' })

    const filter = mockReservationFind.mock.calls[0]?.[0] as Record<string, unknown>
    expect(filter['reserver_name']).toBeInstanceOf(RegExp)
    expect((filter['reserver_name'] as RegExp).flags).toContain('i')
  })

  it('filters by date range when date provided', async () => {
    mockLean.mockResolvedValue([mockReservation])
    mockReservationCountDocuments.mockResolvedValue(1)

    await listReservations({ page: 1, limit: 20, date: '2026-06-01' })

    const filter = mockReservationFind.mock.calls[0]?.[0] as Record<string, unknown>
    const range = filter['reserved_at'] as Record<string, Date>
    expect(range).toHaveProperty('$gte')
    expect(range).toHaveProperty('$lte')
    expect(range['$gte']).toBeInstanceOf(Date)
    expect(range['$lte']).toBeInstanceOf(Date)
  })
})

// ─── getReservationById() ─────────────────────────────────────────────────────

describe('getReservationById()', () => {
  it('returns reservation when found', async () => {
    const leanMock = jest.fn().mockResolvedValue(mockReservation)
    mockReservationFindById.mockReturnValue({ lean: leanMock })

    const result = await getReservationById(reservationId)

    expect(result).toEqual(mockReservation)
    expect(leanMock).toHaveBeenCalled()
  })

  it('throws 404 when not found', async () => {
    const leanMock = jest.fn().mockResolvedValue(null)
    mockReservationFindById.mockReturnValue({ lean: leanMock })

    await expect(getReservationById(reservationId)).rejects.toMatchObject({
      status: 404,
      detail: 'Reservation not found.',
    })
  })
})

// ─── createReservation() ──────────────────────────────────────────────────────

describe('createReservation()', () => {
  it('creates reservation and sets table status to RESERVED on success', async () => {
    const tableDoc = { ...mockTable, status: 'AVAILABLE', save: jest.fn().mockResolvedValue(undefined) }
    mockTableFindById.mockResolvedValue(tableDoc)
    mockReservationCreate.mockResolvedValue(mockReservation)

    const result = await createReservation(createInput, '64f1a2b3c4d5e6f7a8b9c0d9')

    expect(result).toEqual(mockReservation)
    expect(tableDoc.status).toBe('RESERVED')
    expect(tableDoc.save).toHaveBeenCalled()
  })

  it('throws 404 when table not found', async () => {
    mockTableFindById.mockResolvedValue(null)

    await expect(createReservation(createInput, '64f1a2b3c4d5e6f7a8b9c0d9')).rejects.toMatchObject({
      status: 404,
      detail: 'Table not found.',
    })
    expect(mockReservationCreate).not.toHaveBeenCalled()
  })

  it('throws 409 when table is not AVAILABLE', async () => {
    mockTableFindById.mockResolvedValue({ ...mockTable, status: 'OCCUPIED' })

    await expect(createReservation(createInput, '64f1a2b3c4d5e6f7a8b9c0d9')).rejects.toMatchObject({
      status: 409,
      detail: 'Table is not available for reservation.',
    })
    expect(mockReservationCreate).not.toHaveBeenCalled()
  })
})

// ─── updateReservation() ──────────────────────────────────────────────────────

describe('updateReservation()', () => {
  it('updates and returns reservation when status is PENDING', async () => {
    const updatedReservation = { ...mockReservation, party_size: 6 }
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'PENDING' }),
    })
    mockReservationFindByIdAndUpdate.mockResolvedValue(updatedReservation)

    const result = await updateReservation(reservationId, { party_size: 6 })

    expect(result).toEqual(updatedReservation)
  })

  it('throws 404 when reservation not found', async () => {
    mockReservationFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(updateReservation(reservationId, { party_size: 6 })).rejects.toMatchObject({
      status: 404,
      detail: 'Reservation not found.',
    })
  })

  it('throws 409 when reservation is not PENDING', async () => {
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'CONFIRMED' }),
    })

    await expect(updateReservation(reservationId, { party_size: 6 })).rejects.toMatchObject({
      status: 409,
      detail: 'Reservation cannot be updated after it has been confirmed or cancelled.',
    })
    expect(mockReservationFindByIdAndUpdate).not.toHaveBeenCalled()
  })
})

// ─── updateReservationStatus() ────────────────────────────────────────────────

describe('updateReservationStatus()', () => {
  it('PENDING → CONFIRMED: sets reservation CONFIRMED, table OCCUPIED', async () => {
    const confirmedReservation = { ...mockReservation, status: 'CONFIRMED' }
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'PENDING' }),
    })
    mockReservationFindByIdAndUpdate.mockResolvedValue(confirmedReservation)
    mockTableFindByIdAndUpdate.mockResolvedValue({})

    const result = await updateReservationStatus(reservationId, { status: 'CONFIRMED' }, 'CASHIER')

    expect(result).toEqual(confirmedReservation)
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      mockReservation.table_id,
      { status: 'OCCUPIED' },
    )
  })

  it('PENDING → CANCELLED: sets reservation CANCELLED, table AVAILABLE', async () => {
    const cancelledReservation = { ...mockReservation, status: 'CANCELLED' }
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'PENDING' }),
    })
    mockReservationFindByIdAndUpdate.mockResolvedValue(cancelledReservation)
    mockTableFindByIdAndUpdate.mockResolvedValue({})

    const result = await updateReservationStatus(reservationId, { status: 'CANCELLED' }, 'CASHIER')

    expect(result).toEqual(cancelledReservation)
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      mockReservation.table_id,
      { status: 'AVAILABLE' },
    )
  })

  it('throws 400 when reservation is not PENDING (invalid-status-transition)', async () => {
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'CONFIRMED' }),
    })

    await expect(
      updateReservationStatus(reservationId, { status: 'CANCELLED' }, 'CASHIER'),
    ).rejects.toMatchObject({
      status: 400,
      type: 'invalid-status-transition',
    })
    expect(mockReservationFindByIdAndUpdate).not.toHaveBeenCalled()
  })

  it('throws 403 when role is WAITER and status is CANCELLED', async () => {
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockReservation, status: 'PENDING' }),
    })

    await expect(
      updateReservationStatus(reservationId, { status: 'CANCELLED' }, 'WAITER'),
    ).rejects.toMatchObject({
      status: 403,
      detail: 'Waiters are not allowed to cancel reservations.',
    })
    expect(mockReservationFindByIdAndUpdate).not.toHaveBeenCalled()
  })
})

// ─── deleteReservation() ──────────────────────────────────────────────────────

describe('deleteReservation()', () => {
  it('deletes reservation and returns null', async () => {
    mockReservationFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockReservation),
    })
    mockReservationFindByIdAndDelete.mockResolvedValue(mockReservation)

    const result = await deleteReservation(reservationId)

    expect(result).toBeNull()
    expect(mockReservationFindByIdAndDelete).toHaveBeenCalledWith(reservationId)
  })

  it('throws 404 when not found', async () => {
    mockReservationFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(deleteReservation(reservationId)).rejects.toMatchObject({
      status: 404,
      detail: 'Reservation not found.',
    })
  })
})
