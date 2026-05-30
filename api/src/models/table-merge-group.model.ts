import { Schema, model, type Document, type Types } from 'mongoose'

export interface ITableMergeGroup extends Document {
  table_ids: Types.ObjectId[]
  created_by: Types.ObjectId
  created_at: Date
}

const tableMergeGroupSchema = new Schema<ITableMergeGroup>(
  {
    table_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'Table',
      required: true,
      validate: {
        validator: (ids: Types.ObjectId[]) => ids.length >= 2,
        message: 'A merge group must contain at least 2 tables',
      },
    },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
)

export const TableMergeGroupModel = model<ITableMergeGroup>('TableMergeGroup', tableMergeGroupSchema)
