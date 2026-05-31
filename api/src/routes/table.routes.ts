import { Router } from 'express'
import * as tableController from '@/controllers/table.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
} from '@/schemas/table.schema.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), tableController.listTables)
router.post('/', authenticate, authorize(['ADMIN', 'CASHIER']), validate(createTableSchema), tableController.createTable)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), tableController.getTableById)
router.patch('/:id', authenticate, authorize(['ADMIN', 'CASHIER']), validate(updateTableSchema), tableController.updateTable)
router.delete('/:id', authenticate, authorize(['ADMIN', 'CASHIER']), tableController.deleteTable)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), validate(updateTableStatusSchema), tableController.updateTableStatus)
router.post('/:id/move', authenticate, authorize(['ADMIN', 'CASHIER']), tableController.moveTable)

export default router
