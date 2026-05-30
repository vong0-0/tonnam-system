import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as TableService from '@/services/table.service.js'

jest.unstable_mockModule('mongoose', () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn(),
      },
    },
  },
}))

jest.unstable_mockModule('@/models/table.model.js', () => ({
  TableModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts, message: opts['detail'] })),
}))

let listTables: typeof TableService.listTables
let getTableById: typeof TableService.getTableById
let createTable: typeof TableService.createTable
let updateTable: typeof TableService.updateTable
let deleteTable: typeof TableService.deleteTable
let updateTableStatus: typeof TableService.updateTableStatus
let moveTable: typeof TableService.moveTable

let mockFind: jest.Mock
let mockFindById: jest.Mock
let mockFindOne: jest.Mock
let mockFindByIdAndUpdate: jest.Mock
let mockFindByIdAndDelete: jest.Mock
let mockCountDocuments: jest.Mock
let mockCreate: jest.Mock
let mockIsValid: jest.Mock

// find chain — set up in beforeAll, re-linked in beforeEach
let mockLean: jest.Mock
let mockLimit: jest.Mock
let mockSkip: jest.Mock

beforeAll(async () => {
  const mongooseMod = await import('mongoose')
  const modelMod = await import('@/models/table.model.js')
  const serviceMod = await import('@/services/table.service.js')

  mockIsValid = (
    mongooseMod.default as { Types: { ObjectId: { isValid: jest.Mock } } }
  ).Types.ObjectId.isValid

  const TableModel = modelMod.TableModel as {
    find: jest.Mock
    findById: jest.Mock
    findOne: jest.Mock
    findByIdAndUpdate: jest.Mock
    findByIdAndDelete: jest.Mock
    countDocuments: jest.Mock
    create: jest.Mock
  }

  mockFind = TableModel.find
  mockFindById = TableModel.findById
  mockFindOne = TableModel.findOne
  mockFindByIdAndUpdate = TableModel.findByIdAndUpdate
  mockFindByIdAndDelete = TableModel.findByIdAndDelete
  mockCountDocuments = TableModel.countDocuments
  mockCreate = TableModel.create

  mockLean = jest.fn()
  mockLimit = jest.fn().mockReturnValue({ lean: mockLean })
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })

  listTables = serviceMod.listTables
  getTableById = serviceMod.getTableById
  createTable = serviceMod.createTable
  updateTable = serviceMod.updateTable
  deleteTable = serviceMod.deleteTable
  updateTableStatus = serviceMod.updateTableStatus
  moveTable = serviceMod.moveTable
})

beforeEach(() => {
  jest.clearAllMocks()
  mockFind.mockReturnValue({ skip: mockSkip })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockLimit.mockReturnValue({ lean: mockLean })
})

const mockTable = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  table_name: 'T01',
  capacity: 4,
  status: 'AVAILABLE',
  is_temporary: false,
  merge_group_id: null,
  bill_ids: [],
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({}),
}

// ─── listTables() ─────────────────────────────────────────────────────────────

describe('listTables()', () => {
  it('returns paginated list with default page/limit', async () => {
    mockLean.mockResolvedValue([mockTable])
    mockCountDocuments.mockResolvedValue(1)

    const result = await listTables({ page: 1, limit: 20 })

    expect(mockFind).toHaveBeenCalledWith({})
    expect(mockSkip).toHaveBeenCalledWith(0)
    expect(mockLimit).toHaveBeenCalledWith(20)
    expect(result.data).toEqual([mockTable])
    expect(result.pagination).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 })
  })

  it('filters by status when provided', async () => {
    mockLean.mockResolvedValue([mockTable])
    mockCountDocuments.mockResolvedValue(1)

    await listTables({ page: 1, limit: 20, status: 'OCCUPIED' })

    expect(mockFind).toHaveBeenCalledWith({ status: 'OCCUPIED' })
  })

  it('filters by is_temporary when provided', async () => {
    mockLean.mockResolvedValue([mockTable])
    mockCountDocuments.mockResolvedValue(1)

    await listTables({ page: 1, limit: 20, is_temporary: true })

    expect(mockFind).toHaveBeenCalledWith({ is_temporary: true })
  })

  it('filters by search using case-insensitive regex on table_name', async () => {
    mockLean.mockResolvedValue([mockTable])
    mockCountDocuments.mockResolvedValue(1)

    await listTables({ page: 1, limit: 20, search: 'T01' })

    const filter = mockFind.mock.calls[0]?.[0] as Record<string, unknown>
    expect(filter['table_name']).toBeInstanceOf(RegExp)
    expect((filter['table_name'] as RegExp).flags).toContain('i')
  })
})

// ─── getTableById() ───────────────────────────────────────────────────────────

describe('getTableById()', () => {
  it('returns table when found', async () => {
    mockIsValid.mockReturnValue(true)
    const leanMock = jest.fn().mockResolvedValue(mockTable)
    mockFindById.mockReturnValue({ lean: leanMock })

    const result = await getTableById('64f1a2b3c4d5e6f7a8b9c0d1')

    expect(result).toEqual(mockTable)
    expect(leanMock).toHaveBeenCalled()
  })

  it('throws 404 when not found', async () => {
    mockIsValid.mockReturnValue(true)
    const leanMock = jest.fn().mockResolvedValue(null)
    mockFindById.mockReturnValue({ lean: leanMock })

    await expect(getTableById('64f1a2b3c4d5e6f7a8b9c0d1')).rejects.toMatchObject({
      status: 404,
      detail: 'Table not found.',
    })
  })
})

// ─── createTable() ────────────────────────────────────────────────────────────

describe('createTable()', () => {
  const createInput = { table_name: 'T01', capacity: 4, is_temporary: false }

  it('creates and returns table when table_name is unique', async () => {
    mockFindOne.mockResolvedValue(null)
    mockCreate.mockResolvedValue(mockTable)

    const result = await createTable(createInput)

    expect(mockFindOne).toHaveBeenCalledWith({ table_name: 'T01' })
    expect(result).toEqual(mockTable)
  })

  it('throws 409 when table_name already exists', async () => {
    mockFindOne.mockResolvedValue(mockTable)

    await expect(createTable(createInput)).rejects.toMatchObject({
      status: 409,
      detail: 'A table with this name already exists.',
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

// ─── updateTable() ────────────────────────────────────────────────────────────

describe('updateTable()', () => {
  const tableId = '64f1a2b3c4d5e6f7a8b9c0d1'

  it('updates and returns table when valid', async () => {
    const updatedTable = { ...mockTable, capacity: 6 }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTable) })
    mockFindOne.mockResolvedValue(null)
    mockFindByIdAndUpdate.mockResolvedValue(updatedTable)

    const result = await updateTable(tableId, { capacity: 6 })

    expect(result).toEqual(updatedTable)
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      tableId,
      { capacity: 6 },
      { new: true, runValidators: true },
    )
  })

  it('throws 404 when table not found', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(updateTable(tableId, { capacity: 6 })).rejects.toMatchObject({
      status: 404,
      detail: 'Table not found.',
    })
  })

  it('throws 409 when new table_name is already taken by another table', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTable) })
    mockFindOne.mockResolvedValue({ _id: 'another-id', table_name: 'T01' })

    await expect(updateTable(tableId, { table_name: 'T01' })).rejects.toMatchObject({
      status: 409,
      detail: 'A table with this name already exists.',
    })
  })
})

// ─── deleteTable() ────────────────────────────────────────────────────────────

describe('deleteTable()', () => {
  const tableId = '64f1a2b3c4d5e6f7a8b9c0d1'

  it('deletes table when bill_ids is empty', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTable) })
    mockFindByIdAndDelete.mockResolvedValue(mockTable)

    const result = await deleteTable(tableId)

    expect(result).toBeNull()
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(tableId)
  })

  it('throws 404 when table not found', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(deleteTable(tableId)).rejects.toMatchObject({
      status: 404,
      detail: 'Table not found.',
    })
  })

  it('throws 409 when bill_ids.length > 0 (has pending bills)', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, bill_ids: ['billId1'] }),
    })

    await expect(deleteTable(tableId)).rejects.toMatchObject({
      status: 409,
      detail: 'Cannot delete a table that has pending bills.',
    })
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled()
  })
})

// ─── updateTableStatus() ──────────────────────────────────────────────────────

describe('updateTableStatus()', () => {
  const tableId = '64f1a2b3c4d5e6f7a8b9c0d1'

  it('AVAILABLE → OCCUPIED: succeeds', async () => {
    const occupiedTable = { ...mockTable, status: 'OCCUPIED' }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'AVAILABLE' }),
    })
    mockFindByIdAndUpdate.mockResolvedValue(occupiedTable)

    const result = await updateTableStatus(tableId, { status: 'OCCUPIED' })

    expect(result).toEqual(occupiedTable)
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      tableId,
      { status: 'OCCUPIED' },
      { new: true },
    )
  })

  it('OCCUPIED → AVAILABLE: succeeds when bill_ids is empty', async () => {
    const availableTable = { ...mockTable, status: 'AVAILABLE' }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'OCCUPIED', bill_ids: [] }),
    })
    mockFindByIdAndUpdate.mockResolvedValue(availableTable)

    const result = await updateTableStatus(tableId, { status: 'AVAILABLE' })

    expect(result).toEqual(availableTable)
  })

  it('OCCUPIED → AVAILABLE: throws 409 when bill_ids.length > 0', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'OCCUPIED', bill_ids: ['billId1'] }),
    })

    await expect(updateTableStatus(tableId, { status: 'AVAILABLE' })).rejects.toMatchObject({
      status: 409,
      detail: 'Cannot set table to AVAILABLE while it has pending bills.',
    })
  })

  it('PAID → AVAILABLE: succeeds and clears bill_ids to []', async () => {
    const availableTable = { ...mockTable, status: 'AVAILABLE', bill_ids: [] }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'PAID', bill_ids: ['billId1'] }),
    })
    mockFindByIdAndUpdate.mockResolvedValue(availableTable)

    const result = await updateTableStatus(tableId, { status: 'AVAILABLE' })

    expect(result).toEqual(availableTable)
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      tableId,
      { status: 'AVAILABLE', bill_ids: [] },
      { new: true },
    )
  })

  it('RESERVED → OCCUPIED: throws 400 invalid-status-transition', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'RESERVED' }),
    })

    await expect(updateTableStatus(tableId, { status: 'OCCUPIED' })).rejects.toMatchObject({
      status: 400,
      type: 'invalid-status-transition',
    })
  })
})

// ─── moveTable() ──────────────────────────────────────────────────────────────

describe('moveTable()', () => {
  const sourceId = '64f1a2b3c4d5e6f7a8b9c0d1'
  const targetId = '64f1a2b3c4d5e6f7a8b9c0d2'

  it('throws 400 when sourceId === target_table_id', async () => {
    await expect(moveTable(sourceId, { target_table_id: sourceId })).rejects.toMatchObject({
      status: 400,
      type: 'same-table-move',
    })
  })

  it('throws 409 when source.bill_ids is empty', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ ...mockTable, bill_ids: [] }) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'AVAILABLE' }) })

    await expect(moveTable(sourceId, { target_table_id: targetId })).rejects.toMatchObject({
      status: 409,
      detail: 'Source table has no bills to transfer.',
    })
  })

  it('throws 409 when target.status is OCCUPIED', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ ...mockTable, bill_ids: ['billId1'] }) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ ...mockTable, status: 'OCCUPIED' }) })

    await expect(moveTable(sourceId, { target_table_id: targetId })).rejects.toMatchObject({
      status: 409,
      detail: 'Target table is occupied. Use POST /table-merge-groups to merge tables instead.',
    })
  })

  it('succeeds: transfers bill_ids, source → AVAILABLE, target → OCCUPIED', async () => {
    const sourceTable = { ...mockTable, _id: sourceId, bill_ids: ['billId1'], status: 'OCCUPIED' }
    const targetTable = { ...mockTable, _id: targetId, table_name: 'T02', bill_ids: [], status: 'AVAILABLE' }
    mockIsValid.mockReturnValue(true)
    mockFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(sourceTable) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(targetTable) })
    mockFindByIdAndUpdate.mockResolvedValue({})

    const result = await moveTable(sourceId, { target_table_id: targetId })

    expect(result).toMatchObject({
      from_table: { id: sourceId, table_name: 'T01', status: 'AVAILABLE' },
      to_table: { id: targetId, table_name: 'T02', status: 'OCCUPIED' },
    })
    expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(2)
  })
})
