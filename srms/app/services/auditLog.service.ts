import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { PaginatedResponse } from '@/types/api'
import type { AuditLog, ListAuditLogsParams } from '@/types/audit-log'

export async function listAuditLogs(params: ListAuditLogsParams = {}): Promise<PaginatedResponse<AuditLog>> {
  const { data } = await api.get<PaginatedResponse<AuditLog>>(API.AUDIT_LOGS, {
    params: sanitizeParams(params),
  })
  return data
}
