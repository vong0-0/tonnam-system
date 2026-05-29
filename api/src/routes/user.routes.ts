import { Router } from 'express'
import * as userController from '@/controllers/user.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import { createUserSchema, updateUserSchema } from '@/schemas/user.schema.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN']), userController.list)
router.post('/', authenticate, authorize(['ADMIN']), validate(createUserSchema), userController.create)
router.get('/:id', authenticate, authorize(['ADMIN']), userController.getById)
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateUserSchema), userController.update)
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deactivate)

export default router
