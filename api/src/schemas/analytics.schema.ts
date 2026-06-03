import { z } from 'zod'

const periodEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly'])
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

export const salesSummarySchema = z.object({
  period: periodEnum,
  date: dateString,
})

export const salesComparisonSchema = z.object({
  period: periodEnum,
  current_date: dateString,
  previous_date: dateString,
})

export const salesByCategorySchema = z.object({
  period: periodEnum,
  date: dateString,
})

export const menuBestSellersSchema = z.object({
  period: periodEnum,
  date: dateString,
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const menuDeadItemsSchema = z.object({
  period: z.enum(['weekly', 'monthly', 'yearly']),
  date: dateString,
  threshold: z.coerce.number().int().min(0).default(5),
})

export const menuMixSchema = z.object({
  period: periodEnum,
  date: dateString,
  category_id: z.string().optional(),
})

export type SalesSummaryQuery = z.infer<typeof salesSummarySchema>
export type SalesComparisonQuery = z.infer<typeof salesComparisonSchema>
export type SalesByCategoryQuery = z.infer<typeof salesByCategorySchema>
export type MenuBestSellersQuery = z.infer<typeof menuBestSellersSchema>
export type MenuDeadItemsQuery = z.infer<typeof menuDeadItemsSchema>
export type MenuMixQuery = z.infer<typeof menuMixSchema>
