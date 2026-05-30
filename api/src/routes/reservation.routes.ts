import { Router } from 'express'
import * as reservationController from '@/controllers/reservation.controller.js'
import { authenticate } from '@/middleware/authenticate.js'
import { authorize } from '@/middleware/authorize.js'
import { validate } from '@/middleware/validate.js'
import {
  createReservationSchema,
  updateReservationSchema,
  updateReservationStatusSchema,
} from '@/schemas/reservation.schema.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), reservationController.listReservations)
router.post('/', authenticate, authorize(['ADMIN', 'CASHIER']), validate(createReservationSchema), reservationController.createReservation)
router.get('/:id', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), reservationController.getReservationById)
router.patch('/:id', authenticate, authorize(['ADMIN', 'CASHIER']), validate(updateReservationSchema), reservationController.updateReservation)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'CASHIER', 'WAITER']), validate(updateReservationStatusSchema), reservationController.updateReservationStatus)

export default router
