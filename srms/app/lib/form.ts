import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form'
import { z } from 'zod'

export function useZodForm<T extends { _zod: { output: FieldValues } }>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  return useForm<z.infer<T>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: 'onBlur',
    ...options,
  })
}

export type { SubmitHandler, FieldErrors } from 'react-hook-form'
export { z } from 'zod'
