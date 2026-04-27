import pool from './pool'

async function migrate() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ── Науқастар (Patients) ───────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id          SERIAL PRIMARY KEY,
        patient_id  VARCHAR(10)  UNIQUE NOT NULL,
        name        VARCHAR(150) NOT NULL,
        age         INTEGER      NOT NULL CHECK (age > 0 AND age < 130),
        gender      VARCHAR(20)  NOT NULL,
        blood       VARCHAR(5)   NOT NULL,
        condition   VARCHAR(100) NOT NULL,
        doctor      VARCHAR(100) NOT NULL,
        status      VARCHAR(50)  NOT NULL DEFAULT 'Тұрақты',
        ward        VARCHAR(50)  NOT NULL DEFAULT 'Жалпы',
        phone       VARCHAR(30)  NOT NULL,
        admit_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
        notes       TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── Қызметкерлер (Staff) ───────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id          SERIAL PRIMARY KEY,
        staff_id    VARCHAR(10)  UNIQUE NOT NULL,
        name        VARCHAR(150) NOT NULL,
        role        VARCHAR(50)  NOT NULL,
        specialty   VARCHAR(100) NOT NULL DEFAULT '—',
        status      VARCHAR(30)  NOT NULL DEFAULT 'Кезекте',
        patients    INTEGER      NOT NULL DEFAULT 0,
        experience  VARCHAR(20)  NOT NULL,
        rating      NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
        phone       VARCHAR(30)  NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── Шоттар (Bills) ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id          SERIAL PRIMARY KEY,
        bill_id     VARCHAR(10)  UNIQUE NOT NULL,
        patient     VARCHAR(150) NOT NULL,
        service     VARCHAR(100) NOT NULL,
        amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
        bill_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
        status      VARCHAR(30)  NOT NULL DEFAULT 'Күтуде',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── Дәрі-дәрмектер (Supplies) ─────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplies (
        id          SERIAL PRIMARY KEY,
        supply_id   VARCHAR(10)  UNIQUE NOT NULL,
        name        VARCHAR(150) NOT NULL,
        category    VARCHAR(80)  NOT NULL,
        stock       INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
        reorder     INTEGER      NOT NULL CHECK (reorder > 0),
        unit        VARCHAR(30)  NOT NULL,
        cost        NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
        expiry      VARCHAR(10)  NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // ── updated_at trigger ─────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    for (const table of ['patients', 'staff', 'bills', 'supplies']) {
      await client.query(`
        DROP TRIGGER IF EXISTS set_updated_at ON ${table};
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `)
    }

    await client.query('COMMIT')
    console.log('✅ Миграция аяқталды — кестелер: patients, staff, bills, supplies')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Миграция сәтсіз:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
