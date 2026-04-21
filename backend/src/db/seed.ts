import pool from './pool'

async function seed() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ── Patients ──────────────────────────────────
    await client.query(`DELETE FROM patients`)
    await client.query(`ALTER SEQUENCE patients_id_seq RESTART WITH 1`)

    const patients = [
      ['P-001', 'Aisha Nurlanovna',   34, 'Female', 'A+',  'Hypertension',       'Dr. Bekova',   'Stable',     'General',    '+7 701 234 5678', '2026-04-15', 'Regular BP monitoring needed'],
      ['P-002', 'Daniyar Seitkali',   58, 'Male',   'B+',  'Type 2 Diabetes',    'Dr. Omarov',   'Critical',   'ICU',        '+7 702 345 6789', '2026-04-18', 'Insulin adjustment required'],
      ['P-003', 'Elena Marchenko',    45, 'Female', 'O+',  'Fracture',           'Dr. Bekova',   'Recovering', 'Surgery',    '+7 707 456 7890', '2026-04-10', 'Post-op leg fracture, physiotherapy planned'],
      ['P-004', 'Marat Akhmetov',     29, 'Male',   'AB-', 'Appendicitis',       'Dr. Sultanov', 'Post-Op',    'Surgery',    '+7 705 567 8901', '2026-04-19', 'Laparoscopic appendectomy done'],
      ['P-005', 'Zarina Ospanova',    62, 'Female', 'A-',  'Cardiac Arrhythmia', 'Dr. Omarov',   'Stable',     'Cardiology', '+7 700 678 9012', '2026-04-12', 'On antiarrhythmic medication'],
      ['P-006', 'Timur Bekzhanov',    41, 'Male',   'O-',  'Pneumonia',          'Dr. Sultanov', 'Stable',     'General',    '+7 771 789 0123', '2026-04-17', 'Responding well to antibiotics'],
    ]

    for (const p of patients) {
      await client.query(
        `INSERT INTO patients (patient_id, name, age, gender, blood, condition, doctor, status, ward, phone, admit_date, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        p
      )
    }

    // ── Staff ─────────────────────────────────────
    await client.query(`DELETE FROM staff`)
    await client.query(`ALTER SEQUENCE staff_id_seq RESTART WITH 1`)

    const staffMembers = [
      ['S-001', 'Dr. Asel Bekova',     'Doctor',         'General Surgery',   'On Duty',  14, '12 yrs', 4.9, '+7 701 111 2233', 'a.bekova@medicare.kz'],
      ['S-002', 'Dr. Ruslan Omarov',   'Doctor',         'Cardiology',        'On Duty',  9,  '18 yrs', 4.8, '+7 702 222 3344', 'r.omarov@medicare.kz'],
      ['S-003', 'Dr. Kairat Sultanov', 'Doctor',         'Internal Medicine', 'Off Duty', 11, '7 yrs',  4.7, '+7 707 333 4455', 'k.sultanov@medicare.kz'],
      ['S-004', 'Dr. Nurgul Kasymova', 'Doctor',         'Pediatrics',        'On Duty',  6,  '10 yrs', 4.9, '+7 705 444 5566', 'n.kasymova@medicare.kz'],
      ['S-005', 'Ainur Seitkali',      'Nurse',          '—',                 'On Duty',  0,  '5 yrs',  4.6, '+7 700 555 6677', 'a.seitkali@medicare.kz'],
      ['S-006', 'Bekzat Dzhaksybekov', 'Lab Technician', 'Haematology',       'On Duty',  0,  '3 yrs',  4.5, '+7 771 666 7788', 'b.djak@medicare.kz'],
    ]

    for (const s of staffMembers) {
      await client.query(
        `INSERT INTO staff (staff_id, name, role, specialty, status, patients, experience, rating, phone, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        s
      )
    }

    await client.query('COMMIT')
    console.log('✅ Seed complete — 6 patients, 6 staff members inserted')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seed failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
