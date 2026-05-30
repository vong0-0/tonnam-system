import type { NextFunction, Request, Response } from 'express'
import * as auditLogService from '@/services/audit-log.service.js'
import { success } from '@/utils/response.js'

export async function listAuditLogsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const entity_name = req.query['entity_name'] as string | undefined
    const entity_id = req.query['entity_id'] as string | undefined
    const action = req.query['action'] as string | undefined
    const date = req.query['date'] as string | undefined

    const result = await auditLogService.listAuditLogs({
      page,
      limit,
      ...(entity_name !== undefined ? { entity_name } : {}),
      ...(entity_id !== undefined ? { entity_id } : {}),
      ...(action !== undefined ? { action } : {}),
      ...(date !== undefined ? { date } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getAuditLogByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const log = await auditLogService.getAuditLogById(req.params['id'] as string)
    res.json(success(log, 'Audit log retrieved'))
  } catch (err) {
    next(err)
  }
}
