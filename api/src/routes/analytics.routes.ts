import { Router } from 'express'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validateQuery } from '@/middleware/validate-query.js'
import * as analyticsController from '@/controllers/analytics.controller.js'
import {
  salesSummarySchema,
  salesComparisonSchema,
  salesByCategorySchema,
  menuBestSellersSchema,
  menuDeadItemsSchema,
  menuMixSchema,
} from '@/schemas/analytics.schema.js'

const router = Router()

router.get(
  '/sales/summary',
  authenticate,
  authorize(['ADMIN', 'CASHIER']),
  validateQuery(salesSummarySchema),
  analyticsController.getSalesSummary,
)

router.get(
  '/sales/comparison',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(salesComparisonSchema),
  analyticsController.getSalesComparison,
)

router.get(
  '/sales/by-category',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(salesByCategorySchema),
  analyticsController.getSalesByCategory,
)

router.get(
  '/menu/best-sellers',
  authenticate,
  authorize(['ADMIN', 'CASHIER']),
  validateQuery(menuBestSellersSchema),
  analyticsController.getMenuBestSellers,
)

router.get(
  '/menu/dead-items',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(menuDeadItemsSchema),
  analyticsController.getMenuDeadItems,
)

router.get(
  '/menu/mix',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(menuMixSchema),
  analyticsController.getMenuMix,
)

export default router
