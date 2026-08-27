import type { NextFunction, Request, Response } from 'express'
import * as publicMenuService from '@/services/public-menu.service.js'
import { success } from '@/utils/response.js'

export async function listPublicMenuItems(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 24
    const search = req.query['search'] as string | undefined
    const category_id = req.query['category_id'] as string | undefined
    res.json(await publicMenuService.listPublicMenuItems({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
    }))
  } catch (error) {
    next(error)
  }
}

export async function listPublicMenuCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(success(await publicMenuService.listPublicMenuCategories(), 'Public menu categories retrieved successfully'))
  } catch (error) {
    next(error)
  }
}
