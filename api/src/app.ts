import { checkMissingEnvVars } from '@/config/env.js'
import express from 'express'

checkMissingEnvVars()

const app = express()

app.use(express.json())

export default app