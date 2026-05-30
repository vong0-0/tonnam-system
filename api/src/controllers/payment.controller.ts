import type { NextFunction, Request, Response } from 'express'
import * as paymentService from '@/services/payment.service.js'
import { type AuthRequest } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function createPaymentController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const result = await paymentService.createPayment({
      bill_id: req.body.bill_id,
      method: req.body.method,
      amount: req.body.amount,
      cash: req.body.cash,
      qr_promptpay: req.body.qr_promptpay,
      confirmed_by: user.userId,
    })
    res.status(201).json(success(result, 'Payment confirmed'))
  } catch (err) {
    next(err)
  }
}

export async function getPaymentByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payment = await paymentService.getPaymentById(req.params['id'] as string)
    res.json(success(payment, 'Payment retrieved'))
  } catch (err) {
    next(err)
  }
}
