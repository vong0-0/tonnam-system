import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'

// Menu photos are saved here and served by the static /uploads route (see app.ts).
// Directory is git-ignored; ensure it exists at startup.
const MENU_UPLOAD_DIR = fileURLToPath(new URL('../../uploads/menu', import.meta.url))
mkdirSync(MENU_UPLOAD_DIR, { recursive: true })

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Build an Error the global error handler turns into a clean 4xx problem+json. */
function httpError(status: number, detail: string): Error {
  const err = new Error(detail) as Error & {
    status: number
    type: string
    title: string
    detail: string
  }
  err.status = status
  err.type = 'validation-error'
  err.title = 'Bad Request'
  err.detail = detail
  return err
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MENU_UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true)
    else cb(httpError(400, 'Only JPG, PNG, or WebP images are allowed.'))
  },
})

/**
 * Accept a single `image` file, mapping multer's own errors (size limit, etc.)
 * to a 400 problem+json instead of a 500.
 */
export function uploadMenuImage(req: Request, res: Response, next: NextFunction): void {
  upload.single('image')(req, res, (err: unknown) => {
    if (!err) {
      next()
      return
    }
    if (err instanceof multer.MulterError) {
      const detail =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 5MB or smaller.'
          : 'Image upload failed.'
      next(httpError(400, detail))
      return
    }
    next(err)
  })
}
