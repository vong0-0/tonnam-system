import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { AuthRequest } from '@/types/common.types.js'
import type { Role } from '@/types/user.types.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'

export function authorize(roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { role } = (req as AuthRequest).user

    if (!roles.includes(role)) {
      res
        .status(403)
        .setHeader('Content-Type', PROBLEM_CONTENT_TYPE)
        .json(
          problem({
            type: 'forbidden',
            title: 'Forbidden',
            status: 403,
            detail: 'You do not have permission to perform this action.',
            instance: req.path,
          }),
        )
      return
    }

    next()
  }
}
