import pool from './pool'

async function migrateUsers() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        email        VARCHAR(150) NOT NULL UNIQUE,
        password     VARCHAR(255) NOT NULL,
        name         VARCHAR(150) NOT NULL,
        role         VARCHAR(50)  NOT NULL,
        staff_id     VARCHAR(10),
        is_active    BOOLEAN      NOT NULL DEFAULT true,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS set_updated_at ON users;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `)

    await client.query('COMMIT')
    console.log('✅ users кестесі жасалды')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Қате:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrateUsers()
