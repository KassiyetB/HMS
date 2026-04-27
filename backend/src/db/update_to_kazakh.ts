import { readFileSync } from 'fs'
import { join } from 'path'
import pool from './pool'

async function updateToKazakh() {
  const client = await pool.connect()

  try {
    console.log('🔄 Деректерді қазақшаға аударуда...\n')

    // ── Науқастар ──────────────────────────────────
    console.log('📋 Науқастар кестесі...')

    const patientUpdates: [string, string, string][] = [
      // [баған, ескі мән, жаңа мән]
      // Мәртебелер
      ['status', 'Stable',      'Тұрақты'],
      ['status', 'Critical',    'Ауыр'],
      ['status', 'Recovering',  'Сауығуда'],
      ['status', 'Post-Op',     'Операциядан кейін'],
      ['status', 'Discharged',  'Шығарылды'],
      // Палаталар
      ['ward', 'General',    'Жалпы'],
      ['ward', 'Cardiology', 'Кардиология'],
      ['ward', 'Surgery',    'Хирургия'],
      ['ward', 'Pediatrics', 'Педиатрия'],
      ['ward', 'ICU',        'ЖҚББ'],
      // Жынысы
      ['gender', 'Male',   'Ер'],
      ['gender', 'Female', 'Әйел'],
      ['gender', 'Other',  'Басқа'],
      // Дәрігерлер
      ['doctor', 'Dr. Bekova',   'Др. Бекова'],
      ['doctor', 'Dr. Omarov',   'Др. Омаров'],
      ['doctor', 'Dr. Sultanov', 'Др. Сұлтанов'],
      ['doctor', 'Dr. Kasymova', 'Др. Қасымова'],
      ['doctor', 'Dr. Asel Bekova',     'Др. Бекова'],
      ['doctor', 'Dr. Ruslan Omarov',   'Др. Омаров'],
      ['doctor', 'Dr. Kairat Sultanov', 'Др. Сұлтанов'],
      ['doctor', 'Dr. Nurgul Kasymova', 'Др. Қасымова'],
      // Диагноздар
      ['condition', 'Hypertension',      'Гипертония'],
      ['condition', 'Type 2 Diabetes',   'Қант диабеті 2 типі'],
      ['condition', 'Fracture',          'Сынық'],
      ['condition', 'Appendicitis',      'Аппендицит'],
      ['condition', 'Cardiac Arrhythmia','Жүрек аритмиясы'],
      ['condition', 'Pneumonia',         'Пневмония'],
      ['condition', 'Asthma',            'Астма'],
      ['condition', 'Gastritis',         'Гастрит'],
      ['condition', 'Migraine',          'Мигрень'],
      ['condition', 'Other',             'Басқа'],
    ]

    let patientCount = 0
    for (const [col, oldVal, newVal] of patientUpdates) {
      const r = await client.query(`UPDATE patients SET ${col} = $1 WHERE ${col} = $2`, [newVal, oldVal])
      if (r.rowCount && r.rowCount > 0) { console.log(`   ✓ patients.${col}: "${oldVal}" → "${newVal}" (${r.rowCount} жол)`); patientCount += r.rowCount }
    }

    // Patient ID: P-001 → Н-001
    const pidResult = await client.query(`UPDATE patients SET patient_id = CONCAT('Н-', SUBSTRING(patient_id FROM 3)) WHERE patient_id LIKE 'P-%'`)
    if (pidResult.rowCount && pidResult.rowCount > 0) { console.log(`   ✓ patient_id форматы өзгертілді: ${pidResult.rowCount} жол`) }

    console.log(`   → Барлығы: ${patientCount} өріс жаңартылды\n`)

    // ── Қызметкерлер ──────────────────────────────
    console.log('👨‍⚕️ Қызметкерлер кестесі...')

    const staffUpdates: [string, string, string][] = [
      // Мәртебелер
      ['status', 'On Duty',  'Кезекте'],
      ['status', 'Off Duty', 'Кезектен тыс'],
      ['status', 'On Leave', 'Демалыста'],
      // Лауазымдар
      ['role', 'Doctor',         'Дәрігер'],
      ['role', 'Nurse',          'Мейіргер'],
      ['role', 'Lab Technician', 'Зертханашы'],
      ['role', 'Receptionist',   'Регистратор'],
      ['role', 'Pharmacist',     'Фармацевт'],
      // Мамандықтар
      ['specialty', 'General Surgery',   'Жалпы хирургия'],
      ['specialty', 'Cardiology',        'Кардиология'],
      ['specialty', 'Internal Medicine', 'Ішкі аурулар'],
      ['specialty', 'Pediatrics',        'Педиатрия'],
      ['specialty', 'Radiology',         'Радиология'],
      ['specialty', 'Orthopedics',       'Ортопедия'],
      ['specialty', 'Haematology',       'Гематология'],
      // Аттар
      ['name', 'Dr. Asel Bekova',     'Др. Асель Бекова'],
      ['name', 'Dr. Ruslan Omarov',   'Др. Руслан Омаров'],
      ['name', 'Dr. Kairat Sultanov', 'Др. Қайрат Сұлтанов'],
      ['name', 'Dr. Nurgul Kasymova', 'Др. Нұргүл Қасымова'],
      ['name', 'Ainur Seitkali',      'Айнұр Сейтқали'],
      ['name', 'Bekzat Dzhaksybekov', 'Бекзат Джақсыбеков'],
    ]

    let staffCount = 0
    for (const [col, oldVal, newVal] of staffUpdates) {
      const r = await client.query(`UPDATE staff SET ${col} = $1 WHERE ${col} = $2`, [newVal, oldVal])
      if (r.rowCount && r.rowCount > 0) { console.log(`   ✓ staff.${col}: "${oldVal}" → "${newVal}" (${r.rowCount} жол)`); staffCount += r.rowCount }
    }

    // Staff ID: S-001 → Қ-001
    const sidResult = await client.query(`UPDATE staff SET staff_id = CONCAT('Қ-', SUBSTRING(staff_id FROM 3)) WHERE staff_id LIKE 'S-%'`)
    if (sidResult.rowCount && sidResult.rowCount > 0) { console.log(`   ✓ staff_id форматы өзгертілді: ${sidResult.rowCount} жол`) }

    console.log(`   → Барлығы: ${staffCount} өріс жаңартылды\n`)

    // ── Шоттар ────────────────────────────────────
    console.log('💳 Шоттар кестесі...')
    const billStatuses: [string, string][] = [['Paid', 'Төленді'], ['Pending', 'Күтуде'], ['Overdue', 'Мерзімі өткен']]
    for (const [old, nw] of billStatuses) {
      const r = await client.query(`UPDATE bills SET status = $1 WHERE status = $2`, [nw, old])
      if (r.rowCount && r.rowCount > 0) console.log(`   ✓ bills.status: "${old}" → "${nw}"`)
    }
    const bidResult = await client.query(`UPDATE bills SET bill_id = CONCAT('Ш-', SUBSTRING(bill_id FROM 3)) WHERE bill_id LIKE 'B-%'`)
    if (bidResult.rowCount && bidResult.rowCount > 0) console.log(`   ✓ bill_id форматы өзгертілді: ${bidResult.rowCount} жол`)
    console.log()

    // ── Дәрілер ───────────────────────────────────
    console.log('💊 Дәрі-дәрмектер кестесі...')

    const supplyUpdates: [string, string, string][] = [
      // Санаттар
      ['category', 'Analgesics',  'Ауырсынуды басатын'],
      ['category', 'Antibiotics', 'Антибиотик'],
      ['category', 'Endocrine',   'Эндокрин'],
      ['category', 'Fluids',      'Сұйықтық'],
      ['category', 'PPE',         'ЖҚЗ'],
      ['category', 'GI',          'АІЖ'],
      ['category', 'Diabetes',    'Диабет'],
      ['category', 'Cardiology',  'Кардиология'],
      ['category', 'Other',       'Басқа'],
      // Атаулар
      ['name', 'Paracetamol 500mg',   'Парацетамол 500мг'],
      ['name', 'Amoxicillin 250mg',   'Амоксициллин 250мг'],
      ['name', 'Insulin Glargine',    'Инсулин Гларгин'],
      ['name', 'IV Saline 0.9%',      'Физиологиялық ерітінді 0.9%'],
      ['name', 'Surgical Gloves (L)', 'Хирургиялық қолғап (L)'],
      ['name', 'Omeprazole 20mg',     'Омепразол 20мг'],
      ['name', 'Metformin 500mg',     'Метформин 500мг'],
      // Өлшем бірліктері
      ['unit', 'tablets',  'таблетка'],
      ['unit', 'capsules', 'капсула'],
      ['unit', 'vials',    'флакон'],
      ['unit', 'bags',     'қап'],
      ['unit', 'boxes',    'қорап'],
      ['unit', 'bottles',  'шише'],
      ['unit', 'ampoules', 'ампула'],
      ['unit', 'sachets',  'пакет'],
    ]

    let supplyCount = 0
    for (const [col, oldVal, newVal] of supplyUpdates) {
      const r = await client.query(`UPDATE supplies SET ${col} = $1 WHERE ${col} = $2`, [newVal, oldVal])
      if (r.rowCount && r.rowCount > 0) { console.log(`   ✓ supplies.${col}: "${oldVal}" → "${newVal}"`); supplyCount += r.rowCount }
    }

    // Supply ID: M-001 → Д-001
    const supIdResult = await client.query(`UPDATE supplies SET supply_id = CONCAT('Д-', SUBSTRING(supply_id FROM 3)) WHERE supply_id LIKE 'M-%'`)
    if (supIdResult.rowCount && supIdResult.rowCount > 0) console.log(`   ✓ supply_id форматы өзгертілді: ${supIdResult.rowCount} жол`)
    console.log(`   → Барлығы: ${supplyCount} өріс жаңартылды\n`)

    // ── Тексеру ────────────────────────────────────
    const counts = await Promise.all([
      client.query(`SELECT COUNT(*) FROM patients WHERE status NOT IN ('Тұрақты','Ауыр','Сауығуда','Операциядан кейін','Шығарылды') AND status IS NOT NULL`),
      client.query(`SELECT COUNT(*) FROM staff    WHERE status NOT IN ('Кезекте','Кезектен тыс','Демалыста') AND status IS NOT NULL`),
      client.query(`SELECT COUNT(*) FROM bills    WHERE status NOT IN ('Төленді','Күтуде','Мерзімі өткен') AND status IS NOT NULL`),
    ])

    const remaining = counts.map(r => Number(r.rows[0].count))
    console.log('─────────────────────────────────────────')
    if (remaining.every(n => n === 0)) {
      console.log('✅ Барлық деректер сәтті қазақшаға аударылды!')
    } else {
      console.log('⚠️  Ағылшын тіліндегі мәндер қалды:')
      if (remaining[0]) console.log(`   Науқастар: ${remaining[0]} жол`)
      if (remaining[1]) console.log(`   Қызметкерлер: ${remaining[1]} жол`)
      if (remaining[2]) console.log(`   Шоттар: ${remaining[2]} жол`)
    }

  } catch (err) {
    console.error('❌ Қате:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

updateToKazakh()
