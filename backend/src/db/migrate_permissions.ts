import pool from './pool'

async function migratePermissions() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Add allowed_routes column to users — null means use role default
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS allowed_routes TEXT[] DEFAULT NULL;
    `)

    await client.query('COMMIT')
    console.log('✅ allowed_routes бағаны қосылды')
    console.log('   NULL = рөлдің әдепкі рұқсаттары қолданылады')
    console.log('   Массив = жеке рұқсаттар (мысалы, {\'/dashboard\',\'/patients\'})')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Қате:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migratePermissions()
