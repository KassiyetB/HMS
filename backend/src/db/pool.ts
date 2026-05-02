import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // required for Render PostgreSQL
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'hospital_db',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
      }
)

pool.connect((err, client, release) => {
  if (err) { console.error('❌ Database connection failed:', err.message); return }
  release()
  console.log('✅ Connected to PostgreSQL')
})

export default pool
