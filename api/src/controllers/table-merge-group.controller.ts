import type { NextFunction, Request, Response } from 'express'
import * as tableMergeGroupService from '@/services/table-merge-group.service.js'
import { type AuthRequest } from '@/types/index.js'
import { success } from '@/utils/response.js'

export async function createTableMergeGroup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const actor = { id: user.userId, username: user.name, role: user.role }
    const result = await tableMergeGroupService.createTableMergeGroup(req.body, user.userId, actor)
    res.status(201).json(success(result, 'Table merge group created'))
  } catch (err) {
    next(err)
  }
}

export async function getTableMergeGroupById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const include = (req.query['include'] as 'bills' | 'none' | undefined) ?? 'bills'
    const result = await tableMergeGroupService.getTableMergeGroupById(
      req.params['id'] as string,
      include,
    )
    res.json(success(result, 'Table merge group retrieved'))
  } catch (err) {
    next(err)
  }
}

export async function unmergeTableMergeGroup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthRequest
    const actor = { id: user.userId, username: user.name, role: user.role }
    const result = await tableMergeGroupService.unmergeTableMergeGroup(
      req.params['id'] as string,
      req.body,
      actor,
    )
    res.json(success(result, 'Table merge group unmerged'))
  } catch (err) {
    next(err)
  }
}
