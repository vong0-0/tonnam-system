import { checkMissingEnvVars } from '@/config/env.js'
import { connectDB } from '@/config/db.js'
import { errorHandler } from '@/middleware/error-handler.js'
import cookieParser from 'cookie-parser'
import express from 'express'
import authRouter from '@/routes/auth.routes.js'
import userRouter from '@/routes/user.routes.js'

checkMissingEnvVars()
await connectDB()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/users', userRouter)

app.use(errorHandler)

export default app