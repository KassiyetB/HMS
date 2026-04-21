import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { requestLogger } from './middleware/logger'
import { errorHandler, notFound } from './middleware/errorHandler'
import patientRoutes from './routes/patients'
import staffRoutes   from './routes/staff'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ── Routes ────────────────────────────────────────
app.use('/api/patients', patientRoutes)
app.use('/api/staff',    staffRoutes)

// ── Health check ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 + Error handler ───────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏥 MediCare API running on http://localhost:${PORT}`)
  console.log(`   Patients → http://localhost:${PORT}/api/patients`)
  console.log(`   Staff    → http://localhost:${PORT}/api/staff`)
})

export default app
