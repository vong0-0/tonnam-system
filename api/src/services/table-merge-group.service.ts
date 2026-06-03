import mongoose, { type Types } from 'mongoose'
import { type ITableMergeGroup, TableMergeGroupModel } from '@/models/table-merge-group.model.js'
import { type ITable, TableModel } from '@/models/table.model.js'
import { type IBill, BillModel } from '@/models/bill.model.js'
import {
  type CreateTableMergeGroupInput,
  type UnmergeTableMergeGroupInput,
} from '@/schemas/table-merge-group.schema.js'
import { BillStatus, type TableStatus } from '@/types/index.js'
import { createAuditLog } from '@/services/audit-log.service.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'

interface CounterDoc {
  _id: string
  seq: number
}

interface ActorInput {
  id: string
  username: string
  role: string
}

interface TableSummary {
  id: string
  table_name: string
  status: TableStatus
}

interface MergeGroupBill {
  id: string
  short_id: string
  name: string
  total_amount: number
  status: string
}

interface MergeGroupResponse {
  id: string
  merge_group_bill: MergeGroupBill | null
  tables: TableSummary[]
  created_by: string
  created_at?: Date
}

interface UnmergeResult {
  unmerged_tables: Array<{
    id: string
    table_name: string
    status: TableStatus
    bill_ids: string[]
  }>
}

export async function createTableMergeGroup(
  input: CreateTableMergeGroupInput,
  createdBy: string,
  actor: ActorInput,
): Promise<MergeGroupResponse> {
  for (const tid of input.table_ids) {
    if (!mongoose.Types.ObjectId.isValid(tid)) {
      throw problem({
        type: 'validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid table ID format.',
        instance: '/v1/table-merge-groups',
      })
    }
  }

  const tables = await Promise.all(
    input.table_ids.map(async (tid) => {
      const table = (await TableModel.findById(tid).lean()) as ITable | null
      if (!table) {
        throw problem({
          type: 'not-found',
          title: 'Not Found',
          status: 404,
          detail: `Table ${tid} not found.`,
          instance: '/v1/table-merge-groups',
        })
      }
      return table
    }),
  )

  for (const table of tables) {
    if (table.status === 'RESERVED') {
      throw problem({
        type: 'conflict',
        title: 'Conflict',
        status: 409,
        detail: 'Cannot merge a table that is in RESERVED status.',
        instance: '/v1/table-merge-groups',
      })
    }
  }

  const group = await TableMergeGroupModel.create({
    table_ids: input.table_ids.map((tid) => new mongoose.Types.ObjectId(tid)),
    created_by: new mongoose.Types.ObjectId(createdBy),
  })

  await Promise.all(
    input.table_ids.map((tid) => TableModel.findByIdAndUpdate(tid, { merge_group_id: group._id })),
  )

  let merge_group_bill: MergeGroupBill | null = null

  if (input.merge_bills === true) {
    const allBillIds = tables.flatMap((t) => t.bill_ids)

    if (allBillIds.length > 0) {
      const counterResult = await mongoose.connection
        .collection<CounterDoc>('counters')
        .findOneAndUpdate(
          { _id: 'bill' },
          { $inc: { seq: 1 } },
          { returnDocument: 'after', upsert: true },
        )
      const seq = counterResult?.seq ?? 1
      const short_id = `B-${seq.toString().padStart(4, '0')}`

      const bills = (await BillModel.find({ _id: { $in: allBillIds } }).lean()) as IBill[]
      const totalAmount = bills
        .filter((b) => b.status === BillStatus.OPEN)
        .reduce((sum, b) => sum + b.total_amount, 0)

      const groupBill = await BillModel.create({
        short_id,
        name: 'Group Bill',
        table_id: tables[0]!._id,
        status: BillStatus.OPEN,
        total_amount: totalAmount,
        created_by: new mongoose.Types.ObjectId(createdBy),
      })

      await BillModel.updateMany(
        { _id: { $in: allBillIds }, status: BillStatus.OPEN },
        { $set: { status: BillStatus.CANCELLED, cancel_reason: 'Merged into group bill' } },
      )

      await Promise.all([
        TableModel.findByIdAndUpdate(tables[0]!._id, { bill_ids: [groupBill._id] }),
        ...tables.slice(1).map((t) => TableModel.findByIdAndUpdate(t._id, { bill_ids: [] })),
      ])

      merge_group_bill = {
        id: String(groupBill._id),
        short_id: groupBill.short_id,
        name: groupBill.name,
        total_amount: groupBill.total_amount,
        status: groupBill.status,
      }
    }
  }

  await createAuditLog({
    actor,
    action: 'MERGE_TABLES',
    entity_name: 'TableMergeGroup',
    entity_id: group._id as Types.ObjectId,
    reason: 'Tables merged by staff',
    before_state: { table_ids: input.table_ids },
    after_state: {
      merge_group_id: String(group._id),
      merge_bills: input.merge_bills,
    },
  })

  logger.info('Table merge group created', {
    mergeGroupId: String(group._id),
    tableCount: input.table_ids.length,
  })

  return {
    id: String(group._id),
    merge_group_bill,
    tables: tables.map((t) => ({
      id: String(t._id),
      table_name: t.table_name,
      status: t.status,
    })),
    created_by: String(group.created_by),
  }
}

export async function getTableMergeGroupById(
  id: string,
  include: 'bills' | 'none' = 'bills',
): Promise<MergeGroupResponse> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid merge group ID format.',
      instance: `/v1/table-merge-groups/${id}`,
    })
  }

  const group = (await TableMergeGroupModel.findById(id).lean()) as ITableMergeGroup | null
  if (!group) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Merge group not found.',
      instance: `/v1/table-merge-groups/${id}`,
    })
  }

  const rawTables = await TableModel.find({ _id: { $in: group.table_ids } }).lean()
  const tables = rawTables as ITable[]

  void include

  return {
    id: String(group._id),
    merge_group_bill: null,
    tables: tables.map((t) => ({
      id: String(t._id),
      table_name: t.table_name,
      status: t.status,
    })),
    created_by: String(group.created_by),
    created_at: group.created_at,
  }
}

export async function unmergeTableMergeGroup(
  id: string,
  input: UnmergeTableMergeGroupInput,
  actor: ActorInput,
): Promise<UnmergeResult> {
  const mergeGroup = await getTableMergeGroupById(id, 'none')
  const groupTableIds = new Set(mergeGroup.tables.map((t) => t.id))

  const groupTables = (await TableModel.find({
    _id: { $in: mergeGroup.tables.map((t) => t.id) },
  }).lean()) as ITable[]
  const allBillIds = groupTables.flatMap((t) => t.bill_ids.map((bid) => String(bid)))

  const assignedBillIds = new Set(input.bill_assignments.map((a) => a.bill_id))
  for (const billId of allBillIds) {
    if (!assignedBillIds.has(billId)) {
      throw problem({
        type: 'validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'All bills from the merge group must be assigned to a table before unmerging.',
        instance: `/v1/table-merge-groups/${id}`,
      })
    }
  }

  for (const assignment of input.bill_assignments) {
    if (!groupTableIds.has(assignment.table_id)) {
      throw problem({
        type: 'invalid-bill-assignment',
        title: 'Invalid Bill Assignment',
        status: 400,
        detail: 'Bill cannot be assigned to a table that is not part of this merge group.',
        instance: `/v1/table-merge-groups/${id}`,
      })
    }
  }

  const tableBillMap = new Map<string, string[]>()
  for (const t of mergeGroup.tables) {
    tableBillMap.set(t.id, [])
  }
  for (const assignment of input.bill_assignments) {
    const existing = tableBillMap.get(assignment.table_id) ?? []
    existing.push(assignment.bill_id)
    tableBillMap.set(assignment.table_id, existing)
  }

  await Promise.all(
    mergeGroup.tables.map((t) =>
      TableModel.findByIdAndUpdate(t.id, {
        merge_group_id: null,
        status: 'AVAILABLE',
        bill_ids: (tableBillMap.get(t.id) ?? []).map((bid) => new mongoose.Types.ObjectId(bid)),
      }),
    ),
  )

  await TableMergeGroupModel.findByIdAndDelete(id)

  await createAuditLog({
    actor,
    action: 'UNMERGE_TABLES',
    entity_name: 'TableMergeGroup',
    entity_id: new mongoose.Types.ObjectId(id),
    reason: 'Tables unmerged by staff',
    before_state: { merge_group_id: id },
    after_state: { table_ids: mergeGroup.tables.map((t) => t.id) },
  })

  logger.info('Table merge group unmerged', {
    mergeGroupId: id,
    tableCount: mergeGroup.tables.length,
  })

  return {
    unmerged_tables: mergeGroup.tables.map((t) => ({
      id: t.id,
      table_name: t.table_name,
      status: 'AVAILABLE' as TableStatus,
      bill_ids: tableBillMap.get(t.id) ?? [],
    })),
  }
}
