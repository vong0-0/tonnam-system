import mongoose, { type Types } from 'mongoose'
import { type IAuditLog, AuditLogModel } from '@/models/audit-log.model.js'
import { problem } from '@/utils/problem.js'
import { successList, type SuccessListResponse } from '@/utils/response.js'
import { type Pagination } from '@/types/index.js'

export interface CreateAuditLogInput {
  actor: {
    id: string | Types.ObjectId
    username: string
    role: string
  }
  action: string
  entity_name: 'Bill' | 'Order' | 'OrderItem' | 'Table' | 'TableMergeGroup' | 'Payment'
  entity_id: string | Types.ObjectId
  reason: string
  before_state?: Record<string, unknown> | null
  after_state?: Record<string, unknown> | null
}

interface ListAuditLogsQuery {
  page?: number
  limit?: number
  entity_name?: string
  entity_id?: string
  action?: string
  date?: string
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  await AuditLogModel.create({
    actor: {
      id: input.actor.id,
      username: input.actor.username,
      role: input.actor.role,
    },
    action: input.action,
    entity_name: input.entity_name,
    entity_id: input.entity_id,
    reason: input.reason,
    before_state: input.before_state ?? null,
    after_state: input.after_state ?? null,
  })
}

export async function listAuditLogs(
  query: ListAuditLogsQuery,
): Promise<SuccessListResponse<IAuditLog>> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const { entity_name, entity_id, action, date } = query

  const filter: Record<string, unknown> = {}
  if (entity_name !== undefined) filter['entity_name'] = entity_name
  if (entity_id !== undefined && mongoose.Types.ObjectId.isValid(entity_id)) {
    filter['entity_id'] = new mongoose.Types.ObjectId(entity_id)
  }
  if (action !== undefined) filter['action'] = action
  if (date !== undefined) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    filter['created_at'] = { $gte: start, $lte: end }
  }

  const skip = (page - 1) * limit
  const [rawItems, total] = await Promise.all([
    AuditLogModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    AuditLogModel.countDocuments(filter),
  ])

  const items = rawItems as IAuditLog[]
  const totalPages = Math.ceil(total / limit)
  const pagination: Pagination = { page, limit, total, totalPages }

  return successList(items, pagination, 'Audit logs retrieved successfully')
}

export async function getAuditLogById(id: string): Promise<IAuditLog> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Audit log not found.',
      instance: `/v1/audit-logs/${id}`,
    })
  }

  const log = (await AuditLogModel.findById(id).lean()) as IAuditLog | null
  if (!log) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Audit log not found.',
      instance: `/v1/audit-logs/${id}`,
    })
  }

  return log
}
