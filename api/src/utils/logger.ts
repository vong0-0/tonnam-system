import winston from 'winston'

const { combine, timestamp, errors, colorize, printf, json } = winston.format

const isDev = process.env['NODE_ENV'] !== 'production'

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf((info) => {
    const { level, message, timestamp: ts, stack, ...meta } = info
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    if (typeof stack === 'string') {
      return `${String(ts)} ${level}: ${String(message)}\n${stack}${metaStr}`
    }
    return `${String(ts)} ${level}: ${String(message)}${metaStr}`
  })
)

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
)

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
})

export default logger
