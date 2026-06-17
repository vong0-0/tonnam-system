import type { NextFunction, Request, Response } from 'express'
import * as menuItemService from '@/services/menu-item.service.js'
import { success } from '@/utils/response.js'
import { problem } from '@/utils/problem.js'

export async function listMenuItems(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const search = req.query['search'] as string | undefined
    const category_id = req.query['category_id'] as string | undefined
    const isAvailableRaw = req.query['is_available']
    const isSoldOutRaw = req.query['is_sold_out']
    const is_available =
      isAvailableRaw === 'true' ? true : isAvailableRaw === 'false' ? false : undefined
    const is_sold_out =
      isSoldOutRaw === 'true' ? true : isSoldOutRaw === 'false' ? false : undefined

    const result = await menuItemService.listMenuItems({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
      ...(is_available !== undefined ? { is_available } : {}),
      ...(is_sold_out !== undefined ? { is_sold_out } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getMenuItemById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await menuItemService.getMenuItemById(req.params['id'] as string)
    res.json(success(item, 'Menu item retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function createMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await menuItemService.createMenuItem(req.body)
    res.status(201).json(success(item, 'Menu item created'))
  } catch (err) {
    next(err)
  }
}

export async function updateMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await menuItemService.updateMenuItem(req.params['id'] as string, req.body)
    res.json(success(item, 'Menu item updated'))
  } catch (err) {
    next(err)
  }
}

export async function deleteMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await menuItemService.deleteMenuItem(req.params['id'] as string)
    res.json(success(null, 'Menu item deleted'))
  } catch (err) {
    next(err)
  }
}

export async function uploadMenuItemImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file
    if (!file) {
      throw problem({
        type: 'validation-error',
        title: 'Bad Request',
        status: 400,
        detail: 'No image file provided. Send the file in the "image" form field.',
        instance: '/v1/menu-items/image',
      })
    }
    res.status(201).json(success({ filename: file.filename }, 'Image uploaded'))
  } catch (err) {
    next(err)
  }
}

export async function updateMenuItemAvailability(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await menuItemService.updateMenuItemAvailability(
      req.params['id'] as string,
      req.body,
    )
    res.json(success(item, 'Menu item availability updated'))
  } catch (err) {
    next(err)
  }
}
