import { randomUUID } from 'node:crypto'

export const PROBLEM_CONTENT_TYPE = 'application/problem+json'

const BASE_TYPE_URI = 'https://srms.example.com/errors/'

export interface FieldError {
  field: string
  message: string
  code: string
}

/**
 * Input for building a ProblemDetail response.
 * Pass only the slug for `type` — the full URI is prefixed automatically.
 *
 * Standard slugs:
 * @example "validation-error"        400 — request body/query failed schema validation
 * @example "invalid-status-transition" 400 — e.g. PAID table → RESERVED
 * @example "unauthorized"            401 — missing or invalid JWT
 * @example "forbidden"               403 — authenticated but insufficient role
 * @example "not-found"               404 — resource does not exist
 * @example "conflict"                409 — e.g. duplicate bill for same table
 * @example "rate-limit-exceeded"     429 — too many requests
 */
export interface ProblemDetailInput {
  type: string
  title: string
  status: number
  detail: string
  instance: string
  errors?: FieldError[] | null
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance: string
  traceId: string
  timestamp: string
  errors: FieldError[] | null
}

export function problem(input: ProblemDetailInput): ProblemDetail {
  return {
    type: `${BASE_TYPE_URI}${input.type}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    traceId: randomUUID(),
    timestamp: new Date().toISOString(),
    errors: input.errors ?? null,
  }
}
