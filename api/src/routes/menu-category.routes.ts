import { Router } from 'express'
import * as menuCategoryController from '@/controllers/menu-category.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
} from '@/schemas/menu-category.schema.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), menuCategoryController.listMenuCategories)
router.post('/', authenticate, authorize(['ADMIN']), validate(createMenuCategorySchema), menuCategoryController.createMenuCategory)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), menuCategoryController.getMenuCategoryById)
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateMenuCategorySchema), menuCategoryController.updateMenuCategory)
router.delete('/:id', authenticate, authorize(['ADMIN']), menuCategoryController.deleteMenuCategory)

export default router
