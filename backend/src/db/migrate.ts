import pool from './pool'

async function migrate() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ── Patients ──────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id          SERIAL PRIMARY KEY,
        patient_id  VARCHAR(10)  UNIQUE NOT NULL,  -- e.g. P-001
        name        VARCHAR(150) NOT NULL,
        age         INTEGER      NOT NULL CHECK (age > 0 AND age < 130),
        gender      VARCHAR(20)  NOT NULL,
        blood       VARCHAR(5)   NOT NULL,
        condition   VARCHAR(100) NOT NULL,
        doctor      VARCHAR(100) NOT NULL,
        status      VARCHAR(20)  NOT NULL DEFAULT 'Stable',
        ward        VARCHAR(50)  NOT NULL DEFAULT 'General',
        phone       VARCHAR(30)  NOT NULL,
        admit_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
        notes       TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── Staff ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id          SERIAL PRIMARY KEY,
        staff_id    VARCHAR(10)  UNIQUE NOT NULL,  -- e.g. S-001
        name        VARCHAR(150) NOT NULL,
        role        VARCHAR(50)  NOT NULL,
        specialty   VARCHAR(100) NOT NULL DEFAULT '—',
        status      VARCHAR(20)  NOT NULL DEFAULT 'On Duty',
        patients    INTEGER      NOT NULL DEFAULT 0,
        experience  VARCHAR(20)  NOT NULL,
        rating      NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
        phone       VARCHAR(30)  NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── Auto-update updated_at trigger ────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    for (const table of ['patients', 'staff']) {
      await client.query(`
        DROP TRIGGER IF EXISTS set_updated_at ON ${table};
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `)
    }

    await client.query('COMMIT')
    console.log('✅ Migration complete — tables: patients, staff')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
