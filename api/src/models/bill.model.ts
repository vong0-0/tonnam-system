import { Schema, model, type Document, type Types } from 'mongoose'
import { BillStatus } from '@/types/index.js'

export interface IBill extends Document {
  short_id: string
  name: string
  table_id: Types.ObjectId
  parent_bill_id: Types.ObjectId | null
  split_label: string | null
  status: BillStatus
  total_amount: number
  created_by: Types.ObjectId
  cancel_reason: string | null
  created_at: Date
  updated_at: Date
}

const billSchema = new Schema<IBill>(
  {
    short_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    parent_bill_id: { type: Schema.Types.ObjectId, ref: 'Bill', default: null },
    split_label: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.OPEN,
    },
    total_amount: { type: Number, default: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cancel_reason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

billSchema.index({ table_id: 1, status: 1 })
billSchema.index({ status: 1 })

export const BillModel = model<IBill>('Bill', billSchema)
