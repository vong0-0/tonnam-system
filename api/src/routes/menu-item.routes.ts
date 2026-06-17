import { Router } from 'express'
import * as menuItemController from '@/controllers/menu-item.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import { uploadMenuImage } from '@/middleware/upload.js'
import {
  createMenuItemSchema,
  updateMenuItemAvailabilitySchema,
  updateMenuItemSchema,
} from '@/schemas/menu-item.schema.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), menuItemController.listMenuItems)
router.post('/', authenticate, authorize(['ADMIN']), validate(createMenuItemSchema), menuItemController.createMenuItem)
router.post('/image', authenticate, authorize(['ADMIN']), uploadMenuImage, menuItemController.uploadMenuItemImage)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), menuItemController.getMenuItemById)
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateMenuItemSchema), menuItemController.updateMenuItem)
router.delete('/:id', authenticate, authorize(['ADMIN']), menuItemController.deleteMenuItem)
router.patch('/:id/availability', authenticate, authorize(['ADMIN', 'CASHIER']), validate(updateMenuItemAvailabilitySchema), menuItemController.updateMenuItemAvailability)

export default router
