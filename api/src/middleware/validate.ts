import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import type { FieldError } from '@/utils/problem.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'

export function validate(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (result.success) {
      req.body = result.data as unknown
      next()
      return
    }

    const errors: FieldError[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
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
          detail: 'One or more fields failed validation.',
          instance: req.path,
          errors,
        }),
      )
  }
}
