import { Schema, model, type Document, type Types } from 'mongoose'
import { type ReservationStatus, RESERVATION_STATUSES } from '@/types/index.js'

export interface IReservation extends Document {
  table_id: Types.ObjectId
  reserver_name: string
  phone: string
  party_size: number
  reserved_at: Date
  status: ReservationStatus
  notes: string | null
  created_by: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const reservationSchema = new Schema<IReservation>(
  {
    table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    reserver_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    party_size: { type: Number, required: true, min: 1 },
    reserved_at: { type: Date, required: true },
    status: { type: String, required: true, enum: RESERVATION_STATUSES, default: 'PENDING' },
    notes: { type: String, default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

reservationSchema.index({ table_id: 1, status: 1 })
reservationSchema.index({ reserved_at: 1 })
reservationSchema.index({ status: 1 })

export const ReservationModel = model<IReservation>('Reservation', reservationSchema)
