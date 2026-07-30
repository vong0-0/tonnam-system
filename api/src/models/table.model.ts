import { Schema, model, type Document, type Types } from 'mongoose'
import { type TableStatus, TABLE_STATUSES } from '@/types/index.js'

export interface ITable extends Document {
  table_name: string
  capacity: number
  status: TableStatus
  is_temporary: boolean
  merge_group_id: Types.ObjectId | null
  bill_ids: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const tableSchema = new Schema<ITable>(
  {
    table_name: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, enum: TABLE_STATUSES, default: 'AVAILABLE' },
    is_temporary: { type: Boolean, required: true, default: false },
    merge_group_id: { type: Schema.Types.ObjectId, ref: 'TableMergeGroup', default: null },
    bill_ids: { type: [Schema.Types.ObjectId], ref: 'Bill', default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

tableSchema.index({ status: 1 })

export const TableModel = model<ITable>('Table', tableSchema)
