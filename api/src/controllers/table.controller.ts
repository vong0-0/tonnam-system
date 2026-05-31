import type { NextFunction, Request, Response } from 'express'
import * as tableService from '@/services/table.service.js'
import { type AuthRequest, type TableStatus } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function listTables(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const search = req.query['search'] as string | undefined
    const status = req.query['status'] as TableStatus | undefined
    const isTemporaryRaw = req.query['is_temporary']
    const is_temporary =
      isTemporaryRaw === 'true' ? true : isTemporaryRaw === 'false' ? false : undefined

    const result = await tableService.listTables({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(is_temporary !== undefined ? { is_temporary } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getTableById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const table = await tableService.getTableById(req.params['id'] as string)
    res.json(success(table, 'Table retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function createTable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const table = await tableService.createTable(req.body)
    res.status(201).json(success(table, 'Table created'))
  } catch (err) {
    next(err)
  }
}

export async function updateTable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const table = await tableService.updateTable(req.params['id'] as string, req.body)
    res.json(success(table, 'Table updated'))
  } catch (err) {
    next(err)
  }
}

export async function deleteTable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await tableService.deleteTable(req.params['id'] as string)
    res.json(success(null, 'Table deleted'))
  } catch (err) {
    next(err)
  }
}

export async function updateTableStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const table = await tableService.updateTableStatus(req.params['id'] as string, req.body, user.role)
    res.json(success(table, 'Table status updated'))
  } catch (err) {
    next(err)
  }
}

export async function moveTable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await tableService.moveTable(req.params['id'] as string, req.body)
    res.json(success(result, 'Table moved'))
  } catch (err) {
    next(err)
  }
}
