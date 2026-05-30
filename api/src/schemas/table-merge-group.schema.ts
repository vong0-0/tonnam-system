import { z } from 'zod'

export const createTableMergeGroupSchema = z.object({
  table_ids: z.array(z.string().min(1)).min(2),
  merge_bills: z.boolean().optional().default(false),
})

export const unmergeTableMergeGroupSchema = z.object({
  bill_assignments: z
    .array(
      z.object({
        bill_id: z.string().min(1),
        table_id: z.string().min(1),
      }),
    )
    .min(1),
})

export type CreateTableMergeGroupInput = z.infer<typeof createTableMergeGroupSchema>
export type UnmergeTableMergeGroupInput = z.infer<typeof unmergeTableMergeGroupSchema>
