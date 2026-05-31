import { Router } from 'express'
import {
  createOrderController,
  getOrderByIdController,
  listOrdersController,
  updateOrderItemController,
} from '@/controllers/order.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import { createOrderSchema, updateOrderItemSchema } from '@/schemas/order.schema.js'

const router = Router()

router.post('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), validate(createOrderSchema), createOrderController)
router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER', 'KITCHEN']), listOrdersController)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER', 'KITCHEN']), getOrderByIdController)
router.patch('/:id/items/:item_id', authenticate, authorize(['ADMIN', 'CASHIER', 'KITCHEN']), validate(updateOrderItemSchema), updateOrderItemController)

export default router
