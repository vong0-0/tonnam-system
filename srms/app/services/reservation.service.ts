import { api } from '@/lib/api'
import { API } from '@/constants/api'
import { sanitizeParams } from '@/lib/sanitize-params'
import type { Reservation } from '@/types/entities'
import type { ReservationStatus } from '@/types/enums'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface ListReservationsParams {
  page?: number
  limit?: number
  search?: string
  status?: ReservationStatus | 'ALL'
  table_id?: string
  date?: string
}

export interface CreateReservationBody {
  table_id: string
  reserver_name: string
  phone: string
  party_size: number
  reserved_at: string
  notes?: string | null
}

export interface UpdateReservationBody {
  table_id?: string
  reserver_name?: string
  phone?: string
  party_size?: number
  reserved_at?: string
  notes?: string | null
}

export async function listReservations(
  params: ListReservationsParams = {},
): Promise<PaginatedResponse<Reservation>> {
  const { data } = await api.get<PaginatedResponse<Reservation>>(API.RESERVATIONS, {
    params: sanitizeParams(params),
  })
  return data
}

export async function createReservation(body: CreateReservationBody): Promise<Reservation> {
  const { data } = await api.post<ApiResponse<Reservation>>(API.RESERVATIONS, body)
  return data.data
}

export async function updateReservation(
  id: string,
  body: UpdateReservationBody,
): Promise<Reservation> {
  const { data } = await api.patch<ApiResponse<Reservation>>(API.RESERVATION(id), body)
  return data.data
}

export async function updateReservationStatus(
  id: string,
  status: Exclude<ReservationStatus, 'PENDING'>,
): Promise<Reservation> {
  const { data } = await api.patch<ApiResponse<Reservation>>(API.RESERVATION_STATUS(id), {
    status,
  })
  return data.data
}
