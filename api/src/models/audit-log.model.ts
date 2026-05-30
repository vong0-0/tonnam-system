import { Schema, model, type Document, type Types } from 'mongoose'

const AUDIT_LOG_ENTITIES = ['Bill', 'Order', 'OrderItem', 'Table', 'TableMergeGroup', 'Payment'] as const
type AuditLogEntity = (typeof AUDIT_LOG_ENTITIES)[number]

export interface IAuditLog extends Document {
  actor: {
    id: Types.ObjectId
    username: string
    role: string
  }
  action: string
  entity_name: AuditLogEntity
  entity_id: Types.ObjectId
  reason: string
  before_state: unknown
  after_state: unknown
  created_at: Date
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      role: { type: String, required: true },
    },
    action: { type: String, required: true },
    entity_name: { type: String, required: true, enum: AUDIT_LOG_ENTITIES },
    entity_id: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    before_state: { type: Schema.Types.Mixed, default: null },
    after_state: { type: Schema.Types.Mixed, default: null },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)

auditLogSchema.index({ entity_name: 1, entity_id: 1 })
auditLogSchema.index({ created_at: -1 })

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema, 'audit_logs')
