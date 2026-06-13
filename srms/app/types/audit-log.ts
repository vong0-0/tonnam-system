export type AuditLogEntityName = 'Bill' | 'Order' | 'OrderItem' | 'Table' | 'TableMergeGroup' | 'Payment'

export interface AuditLog {
  id: string
  actor: { id: string; username: string; role: string }
  action: string
  entity_name: AuditLogEntityName
  entity_id: string
  reason: string
  before_state: Record<string, unknown> | null
  after_state: Record<string, unknown> | null
  created_at: string
}

export interface ListAuditLogsParams {
  page?: number
  limit?: number
  entity_name?: AuditLogEntityName
  action?: string
  date?: string
}
