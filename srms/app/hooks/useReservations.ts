import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  listReservations,
  createReservation,
  updateReservation,
  updateReservationStatus,
  type ListReservationsParams,
  type CreateReservationBody,
  type UpdateReservationBody,
} from '@/services/reservation.service'
import { TABLE_KEYS } from '@/hooks/useTables'
import type { ReservationStatus } from '@/types/enums'
import { toastSuccess, toastError } from '@/lib/toast'

export const RESERVATION_KEYS = {
  all:  ['reservations'] as const,
  list: (params: ListReservationsParams) => ['reservations', params] as const,
}

export function useReservationsPage(params: ListReservationsParams = {}) {
  const { status, ...rest } = params
  return useQuery({
    queryKey: RESERVATION_KEYS.list(params),
    queryFn: () =>
      listReservations({ ...rest, ...(status && status !== 'ALL' ? { status } : {}) }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReservationBody) => createReservation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ສ້າງການຈອງສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດສ້າງການຈອງໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReservationBody }) =>
      updateReservation(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ອັບເດດການຈອງສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດອັບເດດການຈອງໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: Exclude<ReservationStatus, 'PENDING'>
    }) => updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
      toastSuccess('ອັບເດດສະຖານະການຈອງສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດອັບເດດສະຖານະການຈອງໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
