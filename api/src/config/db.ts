import mongoose from 'mongoose'
import logger from '@/utils/logger.js'

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

mongoose.connection.on('error', (err: Error) => {
  logger.error('MongoDB error', { message: err.message })
})

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(process.env['MONGODB_URI'] ?? '', {
      dbName: process.env['DB_NAME'] ?? 'tonnam',
    })
    logger.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err })
    process.exit(1)
  }
}
