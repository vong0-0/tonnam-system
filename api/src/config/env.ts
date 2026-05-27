import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import logger from '@/utils/logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_EXAMPLE_PATH = join(__dirname, '../../.env.example')

export function checkMissingEnvVars(): void {
  let content: string
  try {
    content = readFileSync(ENV_EXAMPLE_PATH, 'utf-8')
  } catch {
    return
  }

  const keys = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter((key): key is string => key !== undefined && key.length > 0)

  const missing = keys.filter((key) => process.env[key] === undefined)

  if (missing.length > 0) {
    missing.forEach((key) => logger.error(`Missing env var: ${key}`))
    process.exit(1)
  }
}
