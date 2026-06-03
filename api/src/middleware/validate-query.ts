import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import type { FieldError } from '@/utils/problem.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)

    if (result.success) {
      req.query = result.data as typeof req.query
      next()
      return
    }

    const errors: FieldError[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'query',
      message: issue.message,
      code: 'INVALID_VALUE',
    }))

    res
      .status(400)
      .setHeader('Content-Type', PROBLEM_CONTENT_TYPE)
      .json(
        problem({
          type: 'validation-error',
          title: 'Validation Error',
          status: 400,
          detail: 'One or more query parameters failed validation.',
          instance: req.path,
          errors,
        }),
      )
  }
}
