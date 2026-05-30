import mongoose from 'mongoose'
import { type ITableMergeGroup, TableMergeGroupModel } from '@/models/table-merge-group.model.js'
import { type ITable, TableModel } from '@/models/table.model.js'
import {
  type CreateTableMergeGroupInput,
  type UnmergeTableMergeGroupInput,
} from '@/schemas/table-merge-group.schema.js'
import { type TableStatus } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'

interface TableSummary {
  id: string
  table_name: string
  status: TableStatus
}

interface MergeGroupResponse {
  id: string
  merge_group_bill: null
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

  // TODO: if merge_bills === true, merge all existing open bills into one combined bill (Phase 3)

  logger.info('Table merge group created', {
    mergeGroupId: String(group._id),
    tableCount: input.table_ids.length,
  })

  return {
    id: String(group._id),
    merge_group_bill: null,
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

  // TODO: if include === 'bills', populate bill details for each table (Phase 3)
  if (include === 'bills') {
    // Phase 3: populate bill details per table
  }

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
): Promise<UnmergeResult> {
  const mergeGroup = await getTableMergeGroupById(id, 'none')
  const groupTableIds = new Set(mergeGroup.tables.map((t) => t.id))

  // TODO: get all bill_ids from all tables in the group (Phase 3)

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

  await Promise.all(
    mergeGroup.tables.map((t) =>
      TableModel.findByIdAndUpdate(t.id, { merge_group_id: null, status: 'AVAILABLE' }),
    ),
  )

  // TODO: reassign bill_ids to individual tables per bill_assignments (Phase 3)

  await TableMergeGroupModel.findByIdAndDelete(id)

  logger.info('Table merge group unmerged', {
    mergeGroupId: id,
    tableCount: mergeGroup.tables.length,
  })

  return {
    unmerged_tables: mergeGroup.tables.map((t) => ({
      id: t.id,
      table_name: t.table_name,
      status: 'AVAILABLE' as TableStatus,
      bill_ids: [],
    })),
  }
}
