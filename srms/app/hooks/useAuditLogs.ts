import { useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '@/services/auditLog.service'
import type { ListAuditLogsParams } from '@/types/audit-log'

export const AUDIT_LOG_KEYS = {
  all:  ['audit-logs'] as const,
  list: (params: ListAuditLogsParams) => ['audit-logs', params] as const,
}

export function useAuditLogs(params: ListAuditLogsParams = {}) {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.list(params),
    queryFn:  () => listAuditLogs(params),
    staleTime: 0,
  })
}
