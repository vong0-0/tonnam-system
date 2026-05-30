import type { NextFunction, Request, Response } from 'express'
import * as orderService from '@/services/order.service.js'
import { type AuthRequest } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function createOrderController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const result = await orderService.createOrder({
      bill_id: req.body.bill_id,
      items: req.body.items,
      created_by: user.userId,
    })
    res.status(201).json(success(result, 'Order created'))
  } catch (err) {
    next(err)
  }
}

export async function getOrderByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await orderService.getOrderById(req.params['id'] as string)
    res.json(success(result, 'Order retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function listOrdersController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const bill_id = req.query['bill_id'] as string | undefined
    const status = req.query['status'] as string | undefined

    const result = await orderService.listOrders({
      page,
      limit,
      ...(bill_id !== undefined ? { bill_id } : {}),
      ...(status !== undefined ? { status } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function updateOrderItemStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const result = await orderService.updateOrderItemStatus({
      order_id: req.params['id'] as string,
      item_id: req.params['item_id'] as string,
      status: req.body.status,
      reason: req.body.reason,
      actor: { id: user.userId, username: user.name, role: user.role },
    })
    res.json(success(result, 'Order item status updated'))
  } catch (err) {
    next(err)
  }
}
