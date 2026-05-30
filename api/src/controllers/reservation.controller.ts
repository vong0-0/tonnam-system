import type { NextFunction, Request, Response } from 'express'
import * as reservationService from '@/services/reservation.service.js'
import { type AuthRequest } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function listReservations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const search = req.query['search'] as string | undefined
    const status = req.query['status'] as string | undefined
    const table_id = req.query['table_id'] as string | undefined
    const date = req.query['date'] as string | undefined

    const result = await reservationService.listReservations({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(table_id !== undefined ? { table_id } : {}),
      ...(date !== undefined ? { date } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getReservationById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reservation = await reservationService.getReservationById(req.params['id'] as string)
    res.json(success(reservation, 'Reservation retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function createReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const reservation = await reservationService.createReservation(req.body, user.userId)
    res.status(201).json(success(reservation, 'Reservation created'))
  } catch (err) {
    next(err)
  }
}

export async function updateReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reservation = await reservationService.updateReservation(
      req.params['id'] as string,
      req.body,
    )
    res.json(success(reservation, 'Reservation updated'))
  } catch (err) {
    next(err)
  }
}

export async function updateReservationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const reservation = await reservationService.updateReservationStatus(
      req.params['id'] as string,
      req.body,
      user.role,
    )
    res.json(success(reservation, 'Reservation status updated'))
  } catch (err) {
    next(err)
  }
}

export async function deleteReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await reservationService.deleteReservation(req.params['id'] as string)
    res.json(success(null, 'Reservation deleted'))
  } catch (err) {
    next(err)
  }
}
