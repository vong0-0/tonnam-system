import { Schema, model, type Document, type Types } from 'mongoose'
import { OrderItemStatus } from '@/types/index.js'

export interface IOrderItem extends Document {
  order_id: Types.ObjectId
  menu_item_id: Types.ObjectId
  name: string
  quantity: number
  unit_price: number
  note: string | null
  status: OrderItemStatus | null
  cancel_reason: string | null
  quantity_change_reason: string | null
  created_at: Date
  updated_at: Date
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    note: { type: String, default: null },
    status: {
      type: String,
      enum: [OrderItemStatus.COOKED, OrderItemStatus.CANCELLED, null],
      default: null,
    },
    cancel_reason: { type: String, default: null },
    quantity_change_reason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

orderItemSchema.index({ order_id: 1 })
orderItemSchema.index({ order_id: 1, status: 1 })

export const OrderItemModel = model<IOrderItem>('OrderItem', orderItemSchema, 'order_items')
