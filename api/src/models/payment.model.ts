import { Schema, model, type Document, type Types } from 'mongoose'
import { PaymentMethod } from '@/types/index.js'

interface PaymentBreakdown {
  amount: number
  received_amount: number
  change_amount: number
}

export interface IPayment extends Document {
  bill_id: Types.ObjectId
  method: PaymentMethod
  amount: number
  cash: PaymentBreakdown | null
  qr_promptpay: PaymentBreakdown | null
  confirmed_by: Types.ObjectId
  created_at: Date
}

const breakdownSchema = new Schema<PaymentBreakdown>(
  {
    amount: { type: Number },
    received_amount: { type: Number },
    change_amount: { type: Number },
  },
  { _id: false },
)

const paymentSchema = new Schema<IPayment>(
  {
    bill_id: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    amount: { type: Number, required: true, min: 0.01 },
    cash: { type: breakdownSchema, default: null },
    qr_promptpay: { type: breakdownSchema, default: null },
    confirmed_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
)

paymentSchema.index({ bill_id: 1 })

export const PaymentModel = model<IPayment>('Payment', paymentSchema)
