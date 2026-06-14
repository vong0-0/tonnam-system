import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAllUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
} from '@/services/user.service'
import { toastSuccess, toastError } from '@/lib/toast'
import type { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema'

export const USER_KEYS = {
  all:    ['users'] as const,
  list:   () => ['users', 'list'] as const,
  detail: (id: string) => ['users', id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn:  listAllUsers,
    staleTime: 30_000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) => createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toastSuccess('ເພີ່ມພະນັກງານສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເພີ່ມພະນັກງານໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateUserInput) => updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toastSuccess('ແກ້ໄຂຂໍ້ມູນສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toastSuccess('ປິດໃຊ້ງານບັນຊີສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດປິດໃຊ້ງານໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toastSuccess('ເປີດໃຊ້ງານບັນຊີສຳເລັດ')
    },
    onError: (error) => {
      toastError(error, 'ບໍ່ສາມາດເປີດໃຊ້ງານໄດ້ ກະລຸນາລອງໃໝ່')
    },
  })
}
