import { checkMissingEnvVars } from '@/config/env.js'
import { connectDB } from '@/config/db.js'
import { errorHandler } from '@/middleware/error-handler.js'
import cookieParser from 'cookie-parser'
import express from 'express'
import authRouter from '@/routes/auth.routes.js'
import userRouter from '@/routes/user.routes.js'
import tableRouter from '@/routes/table.routes.js'
import tableMergeGroupRouter from '@/routes/table-merge-group.routes.js'
import menuCategoryRouter from '@/routes/menu-category.routes.js'
import menuItemRouter from '@/routes/menu-item.routes.js'
import reservationRouter from '@/routes/reservation.routes.js'
import billRouter from '@/routes/bill.routes.js'
import orderRouter from '@/routes/order.routes.js'
import paymentRouter from '@/routes/payment.routes.js'
import auditLogRouter from '@/routes/audit-log.routes.js'

checkMissingEnvVars()
await connectDB()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/v1/auth', authRouter)
app.use('/v1/users', userRouter)
app.use('/v1/tables', tableRouter)
app.use('/v1/table-merge-groups', tableMergeGroupRouter)
app.use('/v1/menu-categories', menuCategoryRouter)
app.use('/v1/menu-items', menuItemRouter)
app.use('/v1/reservations', reservationRouter)
app.use('/v1/bills', billRouter)
app.use('/v1/orders', orderRouter)
app.use('/v1/payments', paymentRouter)
app.use('/v1/audit-logs', auditLogRouter)

app.use(errorHandler)

export default app