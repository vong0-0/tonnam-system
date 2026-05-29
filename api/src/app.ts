import { checkMissingEnvVars } from '@/config/env.js'
import { errorHandler } from '@/middleware/error-handler.js'
import express from 'express'
import authRouter from './routes/auth.routes.js'

checkMissingEnvVars()

const app = express()

app.use(express.json())

app.use('/v1/auth', authRouter)

app.use(errorHandler)

export default app