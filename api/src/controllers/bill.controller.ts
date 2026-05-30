import type { NextFunction, Request, Response } from 'express'
import * as billService from '@/services/bill.service.js'
import { type AuthRequest } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function createBillController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const bill = await billService.createBill({
      table_id: req.body.table_id,
      name: req.body.name,
      created_by: user.userId,
    })
    res.status(201).json(success(bill, 'Bill created'))
  } catch (err) {
    next(err)
  }
}

export async function getBillByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const detail = await billService.getBillById(req.params['id'] as string)
    res.json(success(detail, 'Bill retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function listBillsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const table_id = req.query['table_id'] as string | undefined
    const status = req.query['status'] as string | undefined

    const result = await billService.listBills({
      page,
      limit,
      ...(table_id !== undefined ? { table_id } : {}),
      ...(status !== undefined ? { status } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function cancelBillController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const bill = await billService.cancelBill({
      id: req.params['id'] as string,
      reason: req.body.reason,
      actor: { id: user.userId, username: user.name, role: user.role },
    })
    res.json(success(bill, 'Bill cancelled'))
  } catch (err) {
    next(err)
  }
}

export async function splitBillController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const result = await billService.splitBill({
      id: req.params['id'] as string,
      bills: req.body.bills,
      actor: { id: user.userId, username: user.name, role: user.role },
    })
    res.status(201).json(success(result, 'Bill split successfully'))
  } catch (err) {
    next(err)
  }
}
