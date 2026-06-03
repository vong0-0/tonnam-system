import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as TableMergeGroupService from '@/services/table-merge-group.service.js'

// ─── Mongoose mock ────────────────────────────────────────────────────────────

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
    },
    Types,
  }
})

// ─── Model mocks ──────────────────────────────────────────────────────────────

jest.unstable_mockModule('@/models/table-merge-group.model.js', () => ({
  TableMergeGroupModel: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/table.model.js', () => ({
  TableModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/bill.model.js', () => ({
  BillModel: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  },
}))

jest.unstable_mockModule('@/services/audit-log.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts })),
}))

jest.unstable_mockModule('@/websocket/handlers.js', () => ({
  io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) },
}))

// ─── Let declarations ─────────────────────────────────────────────────────────

let createTableMergeGroup: typeof TableMergeGroupService.createTableMergeGroup
let unmergeTableMergeGroup: typeof TableMergeGroupService.unmergeTableMergeGroup

let mockTableMergeGroupCreate: jest.Mock
let mockTableMergeGroupFindById: jest.Mock
let mockTableMergeGroupFindByIdAndDelete: jest.Mock

let mockTableFind: jest.Mock
let mockTableFindById: jest.Mock
let mockTableFindByIdAndUpdate: jest.Mock

let mockBillFind: jest.Mock
let mockBillUpdateMany: jest.Mock
let mockBillCreate: jest.Mock

let mockCreateAuditLog: jest.Mock
let mockCounterFindOneAndUpdate: jest.Mock

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const mongooseMod = await import('mongoose')
  const tableMergeGroupModelMod = await import('@/models/table-merge-group.model.js')
  const tableModelMod = await import('@/models/table.model.js')
  const billModelMod = await import('@/models/bill.model.js')
  const auditLogMod = await import('@/services/audit-log.service.js')
  const serviceMod = await import('@/services/table-merge-group.service.js')

  const mockMongoose = (
    mongooseMod as { default: { connection: { collection: jest.Mock } } }
  ).default
  const collectionObj = (mockMongoose.connection.collection as jest.Mock)('counters') as {
    findOneAndUpdate: jest.Mock
  }
  mockCounterFindOneAndUpdate = collectionObj.findOneAndUpdate

  const TableMergeGroupModel = tableMergeGroupModelMod.TableMergeGroupModel as {
    create: jest.Mock
    findById: jest.Mock
    findByIdAndDelete: jest.Mock
  }
  const TableModel = tableModelMod.TableModel as {
    find: jest.Mock
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
  }
  const BillModel = billModelMod.BillModel as {
    find: jest.Mock
    findByIdAndUpdate: jest.Mock
    updateMany: jest.Mock
    create: jest.Mock
  }

  mockTableMergeGroupCreate = TableMergeGroupModel.create
  mockTableMergeGroupFindById = TableMergeGroupModel.findById
  mockTableMergeGroupFindByIdAndDelete = TableMergeGroupModel.findByIdAndDelete

  mockTableFind = TableModel.find
  mockTableFindById = TableModel.findById
  mockTableFindByIdAndUpdate = TableModel.findByIdAndUpdate

  mockBillFind = BillModel.find
  mockBillUpdateMany = BillModel.updateMany
  mockBillCreate = BillModel.create

  mockCreateAuditLog = auditLogMod.createAuditLog as jest.Mock

  createTableMergeGroup = serviceMod.createTableMergeGroup
  unmergeTableMergeGroup = serviceMod.unmergeTableMergeGroup
})

beforeEach(() => {
  jest.clearAllMocks()
  mockCounterFindOneAndUpdate.mockResolvedValue({ _id: 'bill', seq: 1 })
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const groupId  = '64f1a2b3c4d5e6f7a8b9c001'
const table1Id = '64f1a2b3c4d5e6f7a8b9c002'
const table2Id = '64f1a2b3c4d5e6f7a8b9c003'
const bill1Id  = '64f1a2b3c4d5e6f7a8b9c004'
const bill2Id  = '64f1a2b3c4d5e6f7a8b9c005'
const userId   = '64f1a2b3c4d5e6f7a8b9c009'

const actor = { id: userId, username: 'admin01', role: 'ADMIN' }

const mockTable1 = {
  _id: table1Id, table_name: 'โต๊ะ 1', status: 'OCCUPIED',
  bill_ids: [bill1Id], merge_group_id: null,
}
const mockTable2 = {
  _id: table2Id, table_name: 'โต๊ะ 2', status: 'OCCUPIED',
  bill_ids: [bill2Id], merge_group_id: null,
}
const mockGroup = {
  _id: groupId,
  table_ids: [table1Id, table2Id],
  created_by: userId,
  created_at: new Date(),
}

// ─── createTableMergeGroup() ──────────────────────────────────────────────────

describe('createTableMergeGroup()', () => {
  it('creates group with merge_bills: false — bills stay unchanged', async () => {
    mockTableFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockTable1) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockTable2) })
    mockTableMergeGroupCreate.mockResolvedValue(mockGroup)
    mockTableFindByIdAndUpdate.mockResolvedValue({})

    const result = await createTableMergeGroup(
      { table_ids: [table1Id, table2Id], merge_bills: false },
      userId,
      actor,
    )

    expect(result.id).toBe(groupId)
    expect(result.merge_group_bill).toBeNull()
    expect(result.tables).toHaveLength(2)
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      table1Id,
      expect.objectContaining({ merge_group_id: expect.anything() }),
    )
    expect(mockBillUpdateMany).not.toHaveBeenCalled()
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'MERGE_TABLES' }),
    )
  })

  it('creates group with merge_bills: true — merges open bills into group bill', async () => {
    mockTableFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockTable1) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockTable2) })
    mockTableMergeGroupCreate.mockResolvedValue(mockGroup)
    mockBillFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: bill1Id, status: 'OPEN', total_amount: 300 },
        { _id: bill2Id, status: 'OPEN', total_amount: 260 },
      ]),
    })
    mockCounterFindOneAndUpdate.mockResolvedValue({ seq: 42 })
    const newBillId = '64f1a2b3c4d5e6f7a8b9c006'
    mockBillCreate.mockResolvedValue({
      _id: newBillId,
      short_id: 'B-0042',
      name: 'Group Bill',
      total_amount: 560,
      status: 'OPEN',
    })
    mockBillUpdateMany.mockResolvedValue({})
    mockTableFindByIdAndUpdate.mockResolvedValue({})

    const result = await createTableMergeGroup(
      { table_ids: [table1Id, table2Id], merge_bills: true },
      userId,
      actor,
    )

    expect(result.merge_group_bill).not.toBeNull()
    expect(result.merge_group_bill?.short_id).toBe('B-0042')
    expect(result.merge_group_bill?.total_amount).toBe(560)
    expect(mockBillUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'OPEN' }),
      expect.objectContaining({ $set: expect.objectContaining({ status: 'CANCELLED' }) }),
    )
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'MERGE_TABLES' }),
    )
  })

  it('throws 404 when a table is not found', async () => {
    mockTableFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(
      createTableMergeGroup({ table_ids: [table1Id, table2Id], merge_bills: false }, userId, actor),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('throws 409 when a table is RESERVED', async () => {
    mockTableFindById
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ ...mockTable1, status: 'RESERVED' }) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(mockTable2) })

    await expect(
      createTableMergeGroup({ table_ids: [table1Id, table2Id], merge_bills: false }, userId, actor),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('throws 400 when table_id is invalid ObjectId', async () => {
    await expect(
      createTableMergeGroup(
        { table_ids: ['invalid-id', table2Id], merge_bills: false },
        userId,
        actor,
      ),
    ).rejects.toMatchObject({ status: 400 })
  })
})

// ─── unmergeTableMergeGroup() ─────────────────────────────────────────────────

describe('unmergeTableMergeGroup()', () => {
  // getTableMergeGroupById calls TableModel.find once (for table names),
  // then unmergeTableMergeGroup calls TableModel.find again (for bill_ids).
  // mockReturnValue handles both calls with the same response.
  function setupUnmerge(table1BillIds = [bill1Id], table2BillIds = [bill2Id]) {
    mockTableMergeGroupFindById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockGroup),
    })
    mockTableFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { ...mockTable1, bill_ids: table1BillIds },
        { ...mockTable2, bill_ids: table2BillIds },
      ]),
    })
    mockTableFindByIdAndUpdate.mockResolvedValue({})
    mockTableMergeGroupFindByIdAndDelete.mockResolvedValue({})
  }

  it('unmerges group and reassigns bills to correct tables', async () => {
    setupUnmerge()

    const result = await unmergeTableMergeGroup(
      groupId,
      {
        bill_assignments: [
          { bill_id: bill1Id, table_id: table1Id },
          { bill_id: bill2Id, table_id: table2Id },
        ],
      },
      actor,
    )

    expect(result.unmerged_tables).toHaveLength(2)
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      table1Id,
      expect.objectContaining({ merge_group_id: null, status: 'AVAILABLE' }),
    )
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      table2Id,
      expect.objectContaining({ merge_group_id: null, status: 'AVAILABLE' }),
    )
    expect(mockTableMergeGroupFindByIdAndDelete).toHaveBeenCalledWith(groupId)
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UNMERGE_TABLES' }),
    )
  })

  it('sets table to AVAILABLE when no bills assigned to it', async () => {
    setupUnmerge([bill1Id], [])  // table2 has no bills

    const result = await unmergeTableMergeGroup(
      groupId,
      {
        bill_assignments: [{ bill_id: bill1Id, table_id: table1Id }],
      },
      actor,
    )

    const table2Result = result.unmerged_tables.find((t) => t.id === table2Id)
    expect(table2Result?.status).toBe('AVAILABLE')
    expect(table2Result?.bill_ids).toHaveLength(0)
    expect(mockTableFindByIdAndUpdate).toHaveBeenCalledWith(
      table2Id,
      expect.objectContaining({ status: 'AVAILABLE', bill_ids: [] }),
    )
  })

  it('throws 400 when a bill is not assigned before unmerging', async () => {
    setupUnmerge()  // both tables have bills: bill1Id and bill2Id

    await expect(
      unmergeTableMergeGroup(
        groupId,
        {
          // bill2Id is intentionally NOT included
          bill_assignments: [{ bill_id: bill1Id, table_id: table1Id }],
        },
        actor,
      ),
    ).rejects.toMatchObject({ status: 400, type: 'validation-error' })
  })

  it('throws 400 when bill_assignment targets a table outside the group', async () => {
    const outsideTableId = '64f1a2b3c4d5e6f7a8b9c099'
    setupUnmerge([bill1Id], [])  // only bill1Id exists, table2 is empty

    await expect(
      unmergeTableMergeGroup(
        groupId,
        {
          bill_assignments: [{ bill_id: bill1Id, table_id: outsideTableId }],
        },
        actor,
      ),
    ).rejects.toMatchObject({ status: 400 })
  })
})
