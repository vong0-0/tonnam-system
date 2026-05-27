import app from '@/app.js'
import logger from '@/utils/logger.js'

const PORT = Number(process.env['PORT'] ?? 3000)

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`)
})

