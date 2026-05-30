import { Router } from 'express'
import {
  createBillController,
  getBillByIdController,
  listBillsController,
  cancelBillController,
  splitBillController,
} from '@/controllers/bill.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import { createBillSchema, cancelBillSchema, splitBillSchema } from '@/schemas/bill.schema.js'

const router = Router()

router.post('/', authenticate, authorize(['ADMIN', 'CASHIER']), validate(createBillSchema), createBillController)
router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), listBillsController)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), getBillByIdController)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'CASHIER']), validate(cancelBillSchema), cancelBillController)
router.post('/:id/split', authenticate, authorize(['ADMIN', 'CASHIER']), validate(splitBillSchema), splitBillController)

export default router
