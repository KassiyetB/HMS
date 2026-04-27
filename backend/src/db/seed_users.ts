import bcrypt from 'bcryptjs'
import pool from './pool'

// ── Рөлдер бойынша рұқсаттар ─────────────────────
// Дәрігер:    Науқастар, Қызметкерлер, Басқару тақтасы
// Мейіргер:   Науқастар, Басқару тақтасы
// Зертханашы: Дәрі-дәрмектер, Басқару тақтасы
// Регистратор:Науқастар, Шоттар, Басқару тақтасы
// Фармацевт:  Дәрі-дәрмектер, Басқару тақтасы
// Әкімші:     Барлығы

async function seedUsers() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM users`)
    await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1`)

    const salt = await bcrypt.genSalt(10)

    const users = [
      {
        email:    'admin@medicare.kz',
        password: await bcrypt.hash('Admin123!', salt),
        name:     'Әкімші',
        role:     'Әкімші',
        staff_id: null,
      },
      {
        email:    'a.bekova@medicare.kz',
        password: await bcrypt.hash('Doctor123!', salt),
        name:     'Др. Асель Бекова',
        role:     'Дәрігер',
        staff_id: 'Қ-001',
      },
      {
        email:    'r.omarov@medicare.kz',
        password: await bcrypt.hash('Doctor123!', salt),
        name:     'Др. Руслан Омаров',
        role:     'Дәрігер',
        staff_id: 'Қ-002',
      },
      {
        email:    'a.seitkali@medicare.kz',
        password: await bcrypt.hash('Nurse123!', salt),
        name:     'Айнұр Сейтқали',
        role:     'Мейіргер',
        staff_id: 'Қ-005',
      },
      {
        email:    'b.djak@medicare.kz',
        password: await bcrypt.hash('Lab123!', salt),
        name:     'Бекзат Джақсыбеков',
        role:     'Зертханашы',
        staff_id: 'Қ-006',
      },
      {
        email:    'reception@medicare.kz',
        password: await bcrypt.hash('Recept123!', salt),
        name:     'Регистратор',
        role:     'Регистратор',
        staff_id: null,
      },
      {
        email:    'pharmacy@medicare.kz',
        password: await bcrypt.hash('Pharma123!', salt),
        name:     'Фармацевт',
        role:     'Фармацевт',
        staff_id: null,
      },
    ]

    for (const u of users) {
      await client.query(
        `INSERT INTO users (email, password, name, role, staff_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [u.email, u.password, u.name, u.role, u.staff_id]
      )
    }

    await client.query('COMMIT')

    console.log('\n✅ Пайдаланушылар жасалды:\n')
    console.log('  Рөл          | Email                      | Құпия сөз')
    console.log('  -------------|----------------------------|------------')
    console.log('  Әкімші       | admin@medicare.kz          | Admin123!')
    console.log('  Дәрігер      | a.bekova@medicare.kz       | Doctor123!')
    console.log('  Дәрігер      | r.omarov@medicare.kz       | Doctor123!')
    console.log('  Мейіргер     | a.seitkali@medicare.kz     | Nurse123!')
    console.log('  Зертханашы   | b.djak@medicare.kz         | Lab123!')
    console.log('  Регистратор  | reception@medicare.kz      | Recept123!')
    console.log('  Фармацевт    | pharmacy@medicare.kz       | Pharma123!')
    console.log('\n⚠️  Өндірісте барлық құпия сөздерді өзгертіңіз!\n')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Қате:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seedUsers()
