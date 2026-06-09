export function sanitizeParams<T extends object>(params: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in params) {
    const value = (params as Record<string, unknown>)[key]
    if (value === null || value === undefined) continue
    if (value === '') continue
    if (typeof value === 'string' && value.toUpperCase() === 'ALL') continue
    result[key as keyof T] = params[key as keyof T]
  }
  return result
}
