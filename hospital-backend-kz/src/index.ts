import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { requestLogger } from './middleware/logger'
import { errorHandler, notFound } from './middleware/errorHandler'
import patientRoutes from './routes/patients'
import staffRoutes   from './routes/staff'
import billRoutes    from './routes/bills'
import supplyRoutes  from './routes/supplies'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ── Routes ────────────────────────────────────────
app.use('/api/patients', patientRoutes)
app.use('/api/staff',    staffRoutes)
app.use('/api/bills',    billRoutes)
app.use('/api/supplies', supplyRoutes)

// ── Health check ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'жұмыс істеуде',
    timestamp: new Date().toISOString(),
    routes: ['/api/patients', '/api/staff', '/api/bills', '/api/supplies'],
  })
})

// ── 404 + Error ───────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 МедиКер API іске қосылды → http://localhost:${PORT}`)
  console.log(`   Науқастар  → http://localhost:${PORT}/api/patients`)
  console.log(`   Қызметкер  → http://localhost:${PORT}/api/staff`)
  console.log(`   Шоттар     → http://localhost:${PORT}/api/bills`)
  console.log(`   Дәрілер    → http://localhost:${PORT}/api/supplies\n`)
})

export default app
