import mongoose from 'mongoose'
import { type IReservation, ReservationModel } from '@/models/reservation.model.js'
import { TableModel } from '@/models/table.model.js'
import {
  type CreateReservationInput,
  type UpdateReservationInput,
  type UpdateReservationStatusInput,
} from '@/schemas/reservation.schema.js'
import { type Pagination } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'
import { successList, type SuccessListResponse } from '@/utils/response.js'
import { io } from '@/websocket/handlers.js'
import { WS_EVENTS, WS_CHANNELS } from '@/websocket/events.js'

function emitReservation(event: string, reservation: IReservation) {
  io.to(WS_CHANNELS.RESERVATIONS).emit(
    'message',
    JSON.stringify({ event, data: { reservation }, timestamp: new Date().toISOString() }),
  )
}

interface ListReservationsQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  table_id?: string
  date?: string
}

export async function listReservations(
  query: ListReservationsQuery,
): Promise<SuccessListResponse<IReservation>> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const { search, status, table_id, date } = query

  const filter: Record<string, unknown> = {}
  if (search !== undefined) filter['reserver_name'] = new RegExp(search, 'i')
  if (status !== undefined) filter['status'] = status
  if (table_id !== undefined) filter['table_id'] = table_id
  if (date !== undefined) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    filter['reserved_at'] = { $gte: start, $lte: end }
  }

  const skip = (page - 1) * limit
  const [rawItems, total] = await Promise.all([
    ReservationModel.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    ReservationModel.countDocuments(filter),
  ])

  const items = rawItems as IReservation[]
  const totalPages = Math.ceil(total / limit)
  const pagination: Pagination = { page, limit, total, totalPages }

  return successList(items, pagination, 'Reservations retrieved successfully')
}

export async function getReservationById(id: string): Promise<IReservation> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Reservation not found.',
      instance: `/v1/reservations/${id}`,
    })
  }

  const reservation = (await ReservationModel.findById(id).lean()) as IReservation | null
  if (!reservation) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Reservation not found.',
      instance: `/v1/reservations/${id}`,
    })
  }

  return reservation
}

export async function createReservation(
  input: CreateReservationInput,
  createdBy: string,
): Promise<IReservation> {
  if (!mongoose.Types.ObjectId.isValid(input.table_id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Table not found.',
      instance: '/v1/reservations',
    })
  }

  const table = await TableModel.findById(input.table_id)
  if (!table) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Table not found.',
      instance: '/v1/reservations',
    })
  }

  if (table.status !== 'AVAILABLE') {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'Table is not available for reservation.',
      instance: '/v1/reservations',
    })
  }

  const reservation = await ReservationModel.create({
    table_id: input.table_id,
    reserver_name: input.reserver_name,
    phone: input.phone,
    party_size: input.party_size,
    reserved_at: new Date(input.reserved_at),
    notes: input.notes,
    status: 'PENDING',
    created_by: new mongoose.Types.ObjectId(createdBy),
  })

  table.status = 'RESERVED'
  await table.save()

  logger.info('Reservation created', {
    reservationId: String(reservation._id),
    tableId: input.table_id,
  })

  emitReservation(WS_EVENTS.RESERVATION_CREATED, reservation)

  return reservation
}

export async function updateReservation(
  id: string,
  input: UpdateReservationInput,
): Promise<IReservation> {
  const reservation = await getReservationById(id)

  if (reservation.status !== 'PENDING') {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'Reservation cannot be updated after it has been confirmed or cancelled.',
      instance: `/v1/reservations/${id}`,
    })
  }

  if (input.table_id && input.table_id !== String(reservation.table_id)) {
    if (!mongoose.Types.ObjectId.isValid(input.table_id)) {
      throw problem({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Table not found.',
        instance: `/v1/reservations/${id}`,
      })
    }
    const newTable = await TableModel.findById(input.table_id)
    if (!newTable) {
      throw problem({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Table not found.',
        instance: `/v1/reservations/${id}`,
      })
    }
    if (newTable.status !== 'AVAILABLE') {
      throw problem({
        type: 'conflict',
        title: 'Conflict',
        status: 409,
        detail: 'Table is not available for reservation.',
        instance: `/v1/reservations/${id}`,
      })
    }
    await TableModel.findByIdAndUpdate(reservation.table_id, { status: 'AVAILABLE' })
    await TableModel.findByIdAndUpdate(input.table_id, { status: 'RESERVED' })
  }

  const updateData: Record<string, unknown> = { ...input }
  if (input.reserved_at !== undefined) {
    updateData['reserved_at'] = new Date(input.reserved_at)
  }

  const updated = await ReservationModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
  if (!updated) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Reservation not found.',
      instance: `/v1/reservations/${id}`,
    })
  }

  emitReservation(WS_EVENTS.RESERVATION_UPDATED, updated)

  return updated
}

export async function updateReservationStatus(
  id: string,
  input: UpdateReservationStatusInput,
  role: string,
): Promise<IReservation> {
  const reservation = await getReservationById(id)
  const currentStatus = reservation.status

  if (currentStatus !== 'PENDING') {
    throw problem({
      type: 'invalid-status-transition',
      title: 'Invalid Status Transition',
      status: 400,
      detail: `Cannot transition reservation status from ${currentStatus} to ${input.status}.`,
      instance: `/v1/reservations/${id}/status`,
    })
  }

  if (input.status === 'CANCELLED' && role === 'WAITER') {
    throw problem({
      type: 'forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'Waiters are not allowed to cancel reservations.',
      instance: `/v1/reservations/${id}/status`,
    })
  }

  const tableStatus = input.status === 'CONFIRMED' ? 'OCCUPIED' : 'AVAILABLE'

  const [updated] = await Promise.all([
    ReservationModel.findByIdAndUpdate(id, { status: input.status }, { new: true }),
    TableModel.findByIdAndUpdate(reservation.table_id, { status: tableStatus }),
  ])

  if (!updated) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Reservation not found.',
      instance: `/v1/reservations/${id}/status`,
    })
  }

  logger.info('Reservation status updated', {
    reservationId: id,
    from: currentStatus,
    to: input.status,
  })

  emitReservation(WS_EVENTS.RESERVATION_STATUS_UPDATED, updated)

  return updated
}

export async function deleteReservation(id: string): Promise<null> {
  const reservation = await getReservationById(id)
  await ReservationModel.findByIdAndDelete(id)
  logger.info('Reservation deleted', { reservationId: id })
  emitReservation(WS_EVENTS.RESERVATION_DELETED, reservation)
  return null
}
