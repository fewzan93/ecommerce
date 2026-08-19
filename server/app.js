import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // products use external image hosts (Cloudinary, picsum, admin URLs)
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      },
    },
  })
)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
// Stripe webhook must receive the raw request body BEFORE any JSON parsing,
// otherwise the signature verification fails
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use('/api', routes)

// In production, serve the built client and let React Router handle the routes
const clientDist = path.join(__dirname, '..', 'client', 'dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)

export default app