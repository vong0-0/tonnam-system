import { Schema, model, type Document, type Types } from 'mongoose'
import { OrderStatus } from '@/types/index.js'

export interface IOrder extends Document {
  short_id: string
  bill_id: Types.ObjectId
  status: OrderStatus
  created_by: Types.ObjectId
  cancel_reason: string | null
  created_at: Date
  updated_at: Date
}

const orderSchema = new Schema<IOrder>(
  {
    short_id: { type: String, required: true, unique: true },
    bill_id: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.SENT_TO_KITCHEN,
    },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cancel_reason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

orderSchema.index({ bill_id: 1, status: 1 })
orderSchema.index({ status: 1 })

export const OrderModel = model<IOrder>('Order', orderSchema)
