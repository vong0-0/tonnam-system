import { Types } from 'mongoose'
import { type IPayment, PaymentModel } from '@/models/payment.model.js'
import { type IBill, BillModel } from '@/models/bill.model.js'
import { TableModel } from '@/models/table.model.js'
import { BillStatus, PaymentMethod, type TableStatus } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'
import { io } from '@/websocket/handlers.js'
import { WS_EVENTS, WS_CHANNELS } from '@/websocket/events.js'

interface CreatePaymentInput {
  bill_id: string
  method: PaymentMethod
  amount: number
  cash?: {
    received_amount: number
  }
  qr_promptpay?: {
    received_amount: number
  }
  confirmed_by: string
}

export interface CreatePaymentResult {
  payment: IPayment
  bill: IBill
}

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  if (!Types.ObjectId.isValid(input.bill_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Bill not found.',
      instance: '/v1/payments',
    })
  }

  const bill = await BillModel.findById(input.bill_id)
  if (!bill) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Bill not found.',
      instance: '/v1/payments',
    })
  }

  if (bill.status === BillStatus.PAID) {
    throw problem({
      type: 'BILL_ALREADY_PAID',
      title: 'Conflict',
      status: 409,
      detail: 'Bill has already been paid.',
      instance: '/v1/payments',
    })
  }

  if (bill.status === BillStatus.CANCELLED) {
    throw problem({
      type: 'BILL_CANCELLED',
      title: 'Conflict',
      status: 409,
      detail: 'Bill is cancelled and cannot be paid.',
      instance: '/v1/payments',
    })
  }

  if (input.amount !== bill.total_amount) {
    throw problem({
      type: 'PAYMENT_AMOUNT_MISMATCH',
      title: 'Bad Request',
      status: 400,
      detail:
        'Payment amount must equal the bill total_amount. Partial payments are not allowed.',
      instance: '/v1/payments',
    })
  }

  let cashBreakdown: { amount: number; received_amount: number; change_amount: number } | null =
    null
  let qrBreakdown: { amount: number; received_amount: number; change_amount: number } | null = null

  if (input.method === PaymentMethod.CASH) {
    const received = input.cash!.received_amount
    if (received < input.amount) {
      throw problem({
        type: 'INSUFFICIENT_CASH',
        title: 'Bad Request',
        status: 400,
        detail: 'Cash received is less than the bill amount.',
        instance: '/v1/payments',
      })
    }
    cashBreakdown = {
      amount: input.amount,
      received_amount: received,
      change_amount: received - input.amount,
    }
  } else if (input.method === PaymentMethod.QR_PROMPTPAY) {
    cashBreakdown = null
    qrBreakdown = {
      amount: input.amount,
      received_amount: input.qr_promptpay!.received_amount,
      change_amount: 0,
    }
  } else {
    const cashPortion = input.cash!.received_amount
    const qrPortion = input.qr_promptpay!.received_amount
    if (cashPortion + qrPortion !== input.amount) {
      throw problem({
        type: 'MIXED_AMOUNT_MISMATCH',
        title: 'Bad Request',
        status: 400,
        detail: 'Cash and QR amounts must together equal the bill total amount.',
        instance: '/v1/payments',
      })
    }
    cashBreakdown = { amount: cashPortion, received_amount: cashPortion, change_amount: 0 }
    qrBreakdown = { amount: qrPortion, received_amount: qrPortion, change_amount: 0 }
  }

  const payment = (await PaymentModel.create({
    bill_id: new Types.ObjectId(input.bill_id),
    method: input.method,
    amount: input.amount,
    cash: cashBreakdown,
    qr_promptpay: qrBreakdown,
    confirmed_by: new Types.ObjectId(input.confirmed_by),
  })) as IPayment

  bill.status = BillStatus.PAID
  await bill.save()

  const table = await TableModel.findById(bill.table_id)
  if (table) {
    const paidStatus: TableStatus = 'PAID'
    table.status = paidStatus
    await table.save()
  }

  const billChannel = `bill:${input.bill_id}`
  const tableChannel = `table:${String(bill.table_id)}`
  io.to(billChannel).emit('message', JSON.stringify({
    event: WS_EVENTS.BILL_PAYMENT_CONFIRMED,
    channel: billChannel,
    data: { bill_id: input.bill_id, payment_id: String(payment._id), method: payment.method, amount: payment.amount },
    timestamp: new Date().toISOString(),
  }))
  const paidPayload = JSON.stringify({
    event: WS_EVENTS.BILL_STATUS_UPDATED,
    data: { bill_id: input.bill_id, status: bill.status, table_id: String(bill.table_id) },
    timestamp: new Date().toISOString(),
  })
  io.to(billChannel).emit('message', paidPayload)
  io.to(tableChannel).emit('message', paidPayload)
  io.to(WS_CHANNELS.TABLES).emit('message', paidPayload)
  io.to('tables').emit('message', JSON.stringify({
    event: WS_EVENTS.TABLE_STATUS_UPDATED,
    channel: 'tables',
    data: { table_id: String(bill.table_id), status: 'PAID' },
    timestamp: new Date().toISOString(),
  }))

  logger.info('Payment confirmed', {
    paymentId: String(payment._id),
    billId: input.bill_id,
    method: input.method,
    amount: input.amount,
  })

  return { payment, bill }
}

export async function getPaymentById(id: string): Promise<IPayment> {
  if (!Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Payment not found.',
      instance: `/v1/payments/${id}`,
    })
  }

  const payment = (await PaymentModel.findById(id).lean()) as IPayment | null
  if (!payment) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Payment not found.',
      instance: `/v1/payments/${id}`,
    })
  }

  return payment
}
