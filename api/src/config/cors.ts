import type { CorsOptions } from 'cors'

const raw = process.env['ALLOWED_ORIGINS'] ?? ''
const allowedOrigins = raw
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // allow server-to-server requests (no Origin header)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // return no CORS headers — browser will block the request
    callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// for Socket.io cors option (expects string[] | boolean, not a function)
export const wsAllowedOrigins: string[] = allowedOrigins
