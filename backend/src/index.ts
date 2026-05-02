import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { requestLogger } from './middleware/logger'
import { errorHandler, notFound } from './middleware/errorHandler'
import authRoutes    from './routes/auth'
import patientRoutes from './routes/patients'
import staffRoutes   from './routes/staff'
import billRoutes    from './routes/bills'
import supplyRoutes  from './routes/supplies'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// Strip trailing slash from CLIENT_URL if present
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, health checks)
    if (!origin) return callback(null, true)
    // Strip trailing slash from incoming origin before comparing
    const normalised = origin.replace(/\/$/, '')
    if (normalised === clientUrl) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ── Routes ────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/staff',    staffRoutes)
app.use('/api/bills',    billRoutes)
app.use('/api/supplies', supplyRoutes)

// ── Health check ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'жұмыс істеуде', timestamp: new Date().toISOString() })
})

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🏥 МедиКер API іске қосылды → http://localhost:${PORT}`)
  console.log(`   CORS allowed origin: ${clientUrl}`)
  console.log(`   Науқастар  → /api/patients`)
  console.log(`   Қызметкер  → /api/staff`)
  console.log(`   Шоттар     → /api/bills`)
  console.log(`   Дәрілер    → /api/supplies\n`)
})

export default app
