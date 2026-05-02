-- ═══════════════════════════════════════════════════
--  МедиКер — Деректерді қазақшаға аудару
--  Бар деректерді қазақша нұсқаға өзгерту
-- ═══════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────
--  НАУҚАСТАР — мәртебелер, палаталар, дәрігер аттары
-- ─────────────────────────────────────────────────

-- Мәртебелер (status)
UPDATE patients SET status = 'Тұрақты'           WHERE status = 'Stable';
UPDATE patients SET status = 'Ауыр'              WHERE status = 'Critical';
UPDATE patients SET status = 'Сауығуда'          WHERE status = 'Recovering';
UPDATE patients SET status = 'Операциядан кейін' WHERE status = 'Post-Op';
UPDATE patients SET status = 'Шығарылды'         WHERE status = 'Discharged';

-- Палаталар (ward)
UPDATE patients SET ward = 'Жалпы'       WHERE ward = 'General';
UPDATE patients SET ward = 'Кардиология' WHERE ward = 'Cardiology';
UPDATE patients SET ward = 'Хирургия'   WHERE ward = 'Surgery';
UPDATE patients SET ward = 'Педиатрия'  WHERE ward = 'Pediatrics';
UPDATE patients SET ward = 'ЖҚББ'       WHERE ward = 'ICU';

-- Жынысы (gender)
UPDATE patients SET gender = 'Ер'    WHERE gender = 'Male';
UPDATE patients SET gender = 'Әйел'  WHERE gender = 'Female';
UPDATE patients SET gender = 'Басқа' WHERE gender = 'Other';

-- Дәрігер аттары (doctor)
UPDATE patients SET doctor = 'Др. Бекова'   WHERE doctor IN ('Dr. Bekova',   'Dr. Asel Bekova');
UPDATE patients SET doctor = 'Др. Омаров'   WHERE doctor IN ('Dr. Omarov',   'Dr. Ruslan Omarov');
UPDATE patients SET doctor = 'Др. Сұлтанов' WHERE doctor IN ('Dr. Sultanov', 'Dr. Kairat Sultanov');
UPDATE patients SET doctor = 'Др. Қасымова' WHERE doctor IN ('Dr. Kasymova', 'Dr. Nurgul Kasymova');

-- Диагноздар (condition)
UPDATE patients SET condition = 'Гипертония'          WHERE condition = 'Hypertension';
UPDATE patients SET condition = 'Қант диабеті 2 типі' WHERE condition = 'Type 2 Diabetes';
UPDATE patients SET condition = 'Сынық'               WHERE condition = 'Fracture';
UPDATE patients SET condition = 'Аппендицит'          WHERE condition = 'Appendicitis';
UPDATE patients SET condition = 'Жүрек аритмиясы'     WHERE condition = 'Cardiac Arrhythmia';
UPDATE patients SET condition = 'Пневмония'            WHERE condition = 'Pneumonia';
UPDATE patients SET condition = 'Астма'                WHERE condition = 'Asthma';
UPDATE patients SET condition = 'Гастрит'              WHERE condition = 'Gastritis';
UPDATE patients SET condition = 'Мигрень'              WHERE condition = 'Migraine';
UPDATE patients SET condition = 'Басқа'                WHERE condition = 'Other';

-- Patient ID форматын өзгерту (P-001 → Н-001)
UPDATE patients SET patient_id = CONCAT('Н-', SUBSTRING(patient_id FROM 3))
  WHERE patient_id LIKE 'P-%';

-- ─────────────────────────────────────────────────
--  ҚЫЗМЕТКЕРЛЕР — мәртебелер, лауазымдар, мамандықтар
-- ─────────────────────────────────────────────────

-- Мәртебелер (status)
UPDATE staff SET status = 'Кезекте'      WHERE status = 'On Duty';
UPDATE staff SET status = 'Кезектен тыс' WHERE status = 'Off Duty';
UPDATE staff SET status = 'Демалыста'    WHERE status = 'On Leave';

-- Лауазымдар (role)
UPDATE staff SET role = 'Дәрігер'    WHERE role = 'Doctor';
UPDATE staff SET role = 'Мейіргер'   WHERE role = 'Nurse';
UPDATE staff SET role = 'Зертханашы' WHERE role = 'Lab Technician';
UPDATE staff SET role = 'Регистратор'WHERE role = 'Receptionist';
UPDATE staff SET role = 'Фармацевт'  WHERE role = 'Pharmacist';

-- Мамандықтар (specialty)
UPDATE staff SET specialty = 'Жалпы хирургия' WHERE specialty = 'General Surgery';
UPDATE staff SET specialty = 'Кардиология'    WHERE specialty = 'Cardiology';
UPDATE staff SET specialty = 'Ішкі аурулар'   WHERE specialty = 'Internal Medicine';
UPDATE staff SET specialty = 'Педиатрия'      WHERE specialty = 'Pediatrics';
UPDATE staff SET specialty = 'Радиология'     WHERE specialty = 'Radiology';
UPDATE staff SET specialty = 'Ортопедия'      WHERE specialty = 'Orthopedics';
UPDATE staff SET specialty = 'Гематология'    WHERE specialty = 'Haematology';

-- Дәрігер аттарын қазақша транслитерацияға өзгерту
UPDATE staff SET name = 'Др. Асель Бекова'     WHERE name = 'Dr. Asel Bekova';
UPDATE staff SET name = 'Др. Руслан Омаров'    WHERE name = 'Dr. Ruslan Omarov';
UPDATE staff SET name = 'Др. Қайрат Сұлтанов'  WHERE name = 'Dr. Kairat Sultanov';
UPDATE staff SET name = 'Др. Нұргүл Қасымова'  WHERE name = 'Dr. Nurgul Kasymova';
UPDATE staff SET name = 'Айнұр Сейтқали'        WHERE name = 'Ainur Seitkali';
UPDATE staff SET name = 'Бекзат Джақсыбеков'    WHERE name = 'Bekzat Dzhaksybekov';

-- Staff ID форматын өзгерту (S-001 → Қ-001)
UPDATE staff SET staff_id = CONCAT('Қ-', SUBSTRING(staff_id FROM 3))
  WHERE staff_id LIKE 'S-%';

-- ─────────────────────────────────────────────────
--  ШОТТАР — мәртебелер (егер ағылшын тілінде болса)
-- ─────────────────────────────────────────────────
UPDATE bills SET status = 'Төленді'       WHERE status = 'Paid';
UPDATE bills SET status = 'Күтуде'        WHERE status = 'Pending';
UPDATE bills SET status = 'Мерзімі өткен' WHERE status = 'Overdue';

-- Bill ID форматын өзгерту (B-001 → Ш-001)
UPDATE bills SET bill_id = CONCAT('Ш-', SUBSTRING(bill_id FROM 3))
  WHERE bill_id LIKE 'B-%';

-- ─────────────────────────────────────────────────
--  ДӘРІЛЕР — атаулар мен санаттар
-- ─────────────────────────────────────────────────

-- Санаттар (category)
UPDATE supplies SET category = 'Ауырсынуды басатын' WHERE category = 'Analgesics';
UPDATE supplies SET category = 'Антибиотик'          WHERE category = 'Antibiotics';
UPDATE supplies SET category = 'Эндокрин'            WHERE category = 'Endocrine';
UPDATE supplies SET category = 'Сұйықтық'            WHERE category = 'Fluids';
UPDATE supplies SET category = 'ЖҚЗ'                 WHERE category = 'PPE';
UPDATE supplies SET category = 'АІЖ'                 WHERE category = 'GI';
UPDATE supplies SET category = 'Диабет'              WHERE category = 'Diabetes';
UPDATE supplies SET category = 'Кардиология'         WHERE category = 'Cardiology';
UPDATE supplies SET category = 'Анестезия'           WHERE category = 'Anaesthesia';
UPDATE supplies SET category = 'Тыныс алу'           WHERE category = 'Respiratory';
UPDATE supplies SET category = 'Басқа'               WHERE category = 'Other';

-- Дәрі атаулары (name)
UPDATE supplies SET name = 'Парацетамол 500мг'              WHERE name = 'Paracetamol 500mg';
UPDATE supplies SET name = 'Амоксициллин 250мг'             WHERE name = 'Amoxicillin 250mg';
UPDATE supplies SET name = 'Инсулин Гларгин'                WHERE name = 'Insulin Glargine';
UPDATE supplies SET name = 'Физиологиялық ерітінді 0.9%'    WHERE name = 'IV Saline 0.9%';
UPDATE supplies SET name = 'Хирургиялық қолғап (L)'         WHERE name = 'Surgical Gloves (L)';
UPDATE supplies SET name = 'Омепразол 20мг'                 WHERE name = 'Omeprazole 20mg';
UPDATE supplies SET name = 'Метформин 500мг'                WHERE name = 'Metformin 500mg';

-- Өлшем бірліктері (unit)
UPDATE supplies SET unit = 'таблетка' WHERE unit = 'tablets';
UPDATE supplies SET unit = 'капсула'  WHERE unit = 'capsules';
UPDATE supplies SET unit = 'флакон'   WHERE unit = 'vials';
UPDATE supplies SET unit = 'қап'      WHERE unit = 'bags';
UPDATE supplies SET unit = 'қорап'    WHERE unit = 'boxes';
UPDATE supplies SET unit = 'шише'     WHERE unit = 'bottles';
UPDATE supplies SET unit = 'ампула'   WHERE unit = 'ampoules';
UPDATE supplies SET unit = 'пакет'    WHERE unit = 'sachets';

-- Supply ID форматын өзгерту (M-001 → Д-001)
UPDATE supplies SET supply_id = CONCAT('Д-', SUBSTRING(supply_id FROM 3))
  WHERE supply_id LIKE 'M-%';

COMMIT;

-- ─────────────────────────────────────────────────
--  Тексеру сұраныстары
-- ─────────────────────────────────────────────────
SELECT 'НАУҚАСТАР:' AS table_name, patient_id, name, status, ward, gender FROM patients ORDER BY patient_id;
SELECT 'ҚЫЗМЕТКЕРЛЕР:' AS table_name, staff_id, name, role, status FROM staff ORDER BY staff_id;
SELECT 'ШОТТАР:' AS table_name, bill_id, patient, status FROM bills ORDER BY bill_id;
SELECT 'ДӘРІЛЕР:' AS table_name, supply_id, name, category, unit FROM supplies ORDER BY supply_id;
