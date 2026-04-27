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

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ── Маршруттар ────────────────────────────────────
app.use('/api/auth',     authRoutes)      // Жалпы қолжетімді
app.use('/api/patients', patientRoutes)   // Токен + рөл қажет
app.use('/api/staff',    staffRoutes)     // Токен + рөл қажет
app.use('/api/bills',    billRoutes)      // Токен + рөл қажет
app.use('/api/supplies', supplyRoutes)    // Токен + рөл қажет

app.get('/health', (_req, res) => {
  res.json({ status: 'жұмыс істеуде', timestamp: new Date().toISOString() })
})

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🏥 МедиКер API іске қосылды → http://localhost:${PORT}`)
  console.log(`   Кіру      → POST http://localhost:${PORT}/api/auth/login`)
  console.log(`   Науқастар → http://localhost:${PORT}/api/patients`)
  console.log(`   Қызметкер → http://localhost:${PORT}/api/staff`)
  console.log(`   Шоттар    → http://localhost:${PORT}/api/bills`)
  console.log(`   Дәрілер   → http://localhost:${PORT}/api/supplies\n`)
})

export default app
