import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import logger from '@/utils/logger.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'
import type { ProblemDetail } from '@/utils/problem.js'

interface StatusDefaults {
  slug: string
  title: string
  detail: string
}

const STATUS_DEFAULTS: Record<number, StatusDefaults> = {
  400: { slug: 'bad-request',            title: 'Bad Request',            detail: 'The request is invalid.' },
  401: { slug: 'unauthorized',           title: 'Unauthorized',           detail: 'Authentication is required.' },
  403: { slug: 'forbidden',              title: 'Forbidden',              detail: 'You do not have permission to access this resource.' },
  404: { slug: 'not-found',              title: 'Not Found',              detail: 'The requested resource was not found.' },
  409: { slug: 'conflict',              title: 'Conflict',               detail: 'The request conflicts with the current state of the resource.' },
  422: { slug: 'unprocessable-entity',  title: 'Unprocessable Entity',   detail: 'The request could not be processed.' },
  429: { slug: 'rate-limit-exceeded',   title: 'Too Many Requests',      detail: 'You have exceeded the rate limit. Please try again later.' },
}

const FALLBACK: StatusDefaults = {
  slug: 'client-error',
  title: 'Client Error',
  detail: 'The request could not be completed.',
}

function getStatus(err: unknown): number {
  if (typeof err !== 'object' || err === null) return 500
  const obj = err as Record<string, unknown>
  const s = obj['status'] ?? obj['statusCode']
  if (typeof s === 'number' && Number.isInteger(s) && s >= 100 && s < 600) return s
  return 500
}

function getString(err: unknown, key: string): string | undefined {
  if (typeof err !== 'object' || err === null) return undefined
  const val = (err as Record<string, unknown>)[key]
  return typeof val === 'string' ? val : undefined
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = getStatus(err)

  if (status >= 500) {
    if (err instanceof Error) {
      logger.error(err.message, { stack: err.stack, path: req.path })
    } else {
      logger.error('Unhandled server error', { err, path: req.path })
    }

    const body: ProblemDetail = {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred. Please try again later.',
      instance: req.path,
      traceId: randomUUID(),
      timestamp: new Date().toISOString(),
      errors: null,
    }

    res.status(500).setHeader('Content-Type', PROBLEM_CONTENT_TYPE).json(body)
    return
  }

  const message = getString(err, 'message') ?? `HTTP ${status}`
  logger.warn(message, { status, path: req.path })

  const defaults = STATUS_DEFAULTS[status] ?? FALLBACK
  const body = problem({
    type: getString(err, 'type') ?? defaults.slug,
    title: getString(err, 'title') ?? defaults.title,
    status,
    detail: getString(err, 'detail') ?? defaults.detail,
    instance: req.path,
  })

  res.status(status).setHeader('Content-Type', PROBLEM_CONTENT_TYPE).json(body)
}
