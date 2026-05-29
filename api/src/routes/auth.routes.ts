import { Router } from 'express'
import * as authController from '@/controllers/auth.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { validate } from '@/middleware/validate.js'
import { loginSchema } from '@/schemas/auth.schema.js'

const router = Router()

router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticate, authController.logout)
router.post('/ws-ticket', authenticate, authController.wsTicket)

export default router
