import { Router } from 'express'
import {
  createPaymentController,
  getPaymentByIdController,
} from '@/controllers/payment.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import { createPaymentSchema } from '@/schemas/payment.schema.js'

const router = Router()

router.post('/', authenticate, authorize(['ADMIN', 'CASHIER']), validate(createPaymentSchema), createPaymentController)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER']), getPaymentByIdController)

export default router
