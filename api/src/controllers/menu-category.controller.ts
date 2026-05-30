import type { NextFunction, Request, Response } from 'express'
import * as menuCategoryService from '@/services/menu-category.service.js'
import { success } from '@/utils/response.js'

export async function listMenuCategories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const search = req.query['search'] as string | undefined

    const result = await menuCategoryService.listMenuCategories({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getMenuCategoryById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await menuCategoryService.getMenuCategoryById(req.params['id'] as string)
    res.json(success(category, 'Menu category retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function createMenuCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await menuCategoryService.createMenuCategory(req.body)
    res.status(201).json(success(category, 'Menu category created'))
  } catch (err) {
    next(err)
  }
}

export async function updateMenuCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await menuCategoryService.updateMenuCategory(
      req.params['id'] as string,
      req.body,
    )
    res.json(success(category, 'Menu category updated'))
  } catch (err) {
    next(err)
  }
}

export async function deleteMenuCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await menuCategoryService.deleteMenuCategory(req.params['id'] as string)
    res.json(success(null, 'Menu category deleted'))
  } catch (err) {
    next(err)
  }
}
