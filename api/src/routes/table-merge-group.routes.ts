import { Router } from 'express'
import * as tableMergeGroupController from '@/controllers/table-merge-group.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import {
  createTableMergeGroupSchema,
  unmergeTableMergeGroupSchema,
} from '@/schemas/table-merge-group.schema.js'

const router = Router()

router.post('/', authenticate, authorize(['ADMIN', 'CASHIER']), validate(createTableMergeGroupSchema), tableMergeGroupController.createTableMergeGroup)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), tableMergeGroupController.getTableMergeGroupById)
router.post('/:id/unmerge', authenticate, authorize(['ADMIN', 'CASHIER']), validate(unmergeTableMergeGroupSchema), tableMergeGroupController.unmergeTableMergeGroup)

export default router
