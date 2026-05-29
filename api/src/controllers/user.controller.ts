import type { NextFunction, Request, Response } from 'express'
import { type Role } from '@/types/index.js'
import * as userService from '@/services/user.service.js'
import { success, successList } from '@/utils/response.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 20
    const search = req.query['search'] as string | undefined
    const role = req.query['role'] as Role | undefined
    const isActiveRaw = req.query['is_active']
    const is_active =
      isActiveRaw === 'true' ? true : isActiveRaw === 'false' ? false : undefined

    const { items, pagination } = await userService.listUsers({
      page,
      limit,
      ...(search !== undefined ? { search } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(is_active !== undefined ? { is_active } : {}),
    })
    res.json(successList(items, pagination, 'Users retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUserById(req.params['id'] as string)
    res.json(success(user, 'User retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json(success(user, 'User created'))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateUser(req.params['id'] as string, req.body)
    res.json(success(user, 'User updated'))
  } catch (err) {
    next(err)
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.deactivateUser(req.params['id'] as string)
    res.json(success(user, 'User deactivated'))
  } catch (err) {
    next(err)
  }
}
