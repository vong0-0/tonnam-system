import { checkMissingEnvVars } from '@/config/env.js'
import { errorHandler } from '@/middleware/error-handler.js'
import express from 'express'

checkMissingEnvVars()

const app = express()

app.use(express.json())

// routes go here

app.use(errorHandler)

export default app