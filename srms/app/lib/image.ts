/**
 * Compose a displayable image URL from a stored `image_url` value.
 *
 * The backend/DB stores a host-agnostic value — usually a bare filename
 * (e.g. `a339f067-….jpg`) seeded from the old system. The frontend owns the
 * host prefix via `VITE_IMAGE_BASE_URL` and composes the full URL here.
 *
 * Rules:
 *  - empty / null / undefined            → null (caller shows a placeholder)
 *  - absolute URL (http(s):// or //)     → returned unchanged
 *  - data: URI                           → returned unchanged
 *  - otherwise (relative filename)       → `${VITE_IMAGE_BASE_URL}/<filename>`
 *    (if no base is configured, the value is returned as-is)
 */
const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) ?? ''

export function resolveImageUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const v = value.trim()
  if (!v) return null

  if (/^(https?:)?\/\//i.test(v) || v.startsWith('data:')) return v
  if (!IMAGE_BASE) return v

  return `${IMAGE_BASE.replace(/\/+$/, '')}/${v.replace(/^\/+/, '')}`
}
