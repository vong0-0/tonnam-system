import { Router } from 'express'
import {
  listAuditLogsController,
  getAuditLogByIdController,
} from '@/controllers/audit-log.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN']), listAuditLogsController)
router.get('/:id', authenticate, authorize(['ADMIN']), getAuditLogByIdController)

export default router
