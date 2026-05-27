import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthRequest, UserPayload } from '@/types/common.types.js'
import { ROLES } from '@/types/user.types.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'

function isUserPayload(value: unknown): value is UserPayload {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  const roleValues = Object.values(ROLES) as string[]
  return (
    typeof obj['userId'] === 'string' &&
    typeof obj['name'] === 'string' &&
    typeof obj['role'] === 'string' &&
    roleValues.includes(obj['role'])
  )
}

function rejectUnauthorized(req: Request, res: Response): void {
  res
    .status(401)
    .setHeader('Content-Type', PROBLEM_CONTENT_TYPE)
    .json(
      problem({
        type: 'unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication credentials are missing or the token is invalid.',
        instance: req.path,
      }),
    )
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']

  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    rejectUnauthorized(req, res)
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env['JWT_SECRET']

  if (!secret) {
    next(new Error('JWT_SECRET is not configured'))
    return
  }

  try {
    const decoded = jwt.verify(token, secret)

    if (!isUserPayload(decoded)) {
      rejectUnauthorized(req, res)
      return
    }

    ; (req as AuthRequest).user = decoded
    next()
  } catch {
    rejectUnauthorized(req, res)
  }
}
