-- =====================================================================
--  Dashboard_ConMas — LOCAL SETUP (PostgreSQL, Windows)
-- =====================================================================
--  Jalankan SEKALI lewat psql:
--      psql -U postgres -f local_setup.sql
--  (isi password user "postgres" pas diminta)
--
--  Ini bikin:
--   1) Database baru "dashboard_conmas"
--   2) Timezone DB di-set ke Asia/Jakarta (WAJIB — query backend pakai
--      "AT TIME ZONE 'Asia/Jakarta'" buat filter tanggal shift)
--   3) Tabel "view_report_25290" — tiruan struktur view ConMas asli dari
--      kantor (92 kolom cluster_1_X_n/t), sesuai yang dipanggil di
--      Backendd/routes/dashboard.js. Ini TABLE biasa, bukan VIEW asli,
--      jadi bebas diisi/diubah manual buat kebutuhan dev.
--   4) Dummy data 4 baris (Shift 1 & 2, hari ini & kemarin) supaya
--      dashboard langsung ada isinya begitu backend dijalankan,
--      gak peduli jam berapa pun kamu buka.
--
--  CATATAN: data dummy di sini cuma buat tampilan jalan & development
--  UI/logic. Bukan data produksi asli — kalau mau test skenario lain
--  (reject tinggi, downtime banyak, dst), tinggal edit angka di bagian
--  INSERT di bawah, atau jalanin UPDATE/INSERT baru sendiri.
-- =====================================================================

DROP DATABASE IF EXISTS dashboard_conmas;
CREATE DATABASE dashboard_conmas;
ALTER DATABASE dashboard_conmas SET timezone TO 'Asia/Jakarta';

\c dashboard_conmas

-- =====================================================================
-- Dashboard_ConMas — LOCAL DEV SCHEMA (Windows / PostgreSQL)
-- Tiruan struktur view_report_25290 dari sistem ConMas kantor.
-- Dibuat sebagai TABLE biasa (bukan VIEW) supaya gampang diisi manual.
-- Nama tabel & kolom WAJIB sama persis dgn Backendd/routes/dashboard.js
-- =====================================================================

DROP TABLE IF EXISTS view_report_25290;

CREATE TABLE view_report_25290 (
  cluster_1_17_t         TEXT,  -- line
  cluster_1_30_t         TEXT,  -- cell_leader
  cluster_1_43_t         TEXT,  -- teknisi
  cluster_1_55_t         TEXT,  -- inspector
  cluster_1_44_d         TIMESTAMP,  -- tanggal
  cluster_1_68_t         TEXT,  -- shift
  cluster_1_113_n        TEXT,  -- reject_ppm
  cluster_1_2913_n       TEXT,  -- output_plan
  cluster_1_2914_n       TEXT,  -- output_actual
  cluster_1_2915_n       TEXT,  -- deviasi_target
  cluster_1_2917_n       TEXT,  -- qty_reject
  cluster_1_2918_n       TEXT,  -- stoptime_plan
  cluster_1_2919_n       TEXT,  -- stoptime_actual
  cluster_1_2797_n       TEXT,  -- stoptime_man
  cluster_1_2820_n       TEXT,  -- stoptime_method
  cluster_1_2843_n       TEXT,  -- stoptime_material
  cluster_1_2866_n       TEXT,  -- stoptime_machine
  cluster_1_85_n         TEXT,  -- oee
  cluster_1_7_t          TEXT,  -- slot0.cl_no
  cluster_1_8_t          TEXT,  -- slot0.product_name
  cluster_1_12_n         TEXT,  -- slot0.cycle_time_swi
  cluster_1_13_n         TEXT,  -- slot0.cycle_time_actual
  cluster_1_20_t         TEXT,  -- slot1.cl_no
  cluster_1_21_t         TEXT,  -- slot1.product_name
  cluster_1_25_n         TEXT,  -- slot1.cycle_time_swi
  cluster_1_26_n         TEXT,  -- slot1.cycle_time_actual
  cluster_1_33_t         TEXT,  -- slot2.cl_no
  cluster_1_34_t         TEXT,  -- slot2.product_name
  cluster_1_38_n         TEXT,  -- slot2.cycle_time_swi
  cluster_1_39_n         TEXT,  -- slot2.cycle_time_actual
  cluster_1_45_t         TEXT,  -- slot3.cl_no
  cluster_1_46_t         TEXT,  -- slot3.product_name
  cluster_1_50_n         TEXT,  -- slot3.cycle_time_swi
  cluster_1_51_n         TEXT,  -- slot3.cycle_time_actual
  cluster_1_57_t         TEXT,  -- slot4.cl_no
  cluster_1_58_t         TEXT,  -- slot4.product_name
  cluster_1_62_n         TEXT,  -- slot4.cycle_time_swi
  cluster_1_63_n         TEXT,  -- slot4.cycle_time_actual
  cluster_1_69_t         TEXT,  -- slot5.cl_no
  cluster_1_70_t         TEXT,  -- slot5.product_name
  cluster_1_74_n         TEXT,  -- slot5.cycle_time_swi
  cluster_1_75_n         TEXT,  -- slot5.cycle_time_actual
  cluster_1_151_n        TEXT,  -- jam 06-07 plan
  cluster_1_152_n        TEXT,  -- jam 06-07 actual
  cluster_1_256_n        TEXT,  -- jam 07-08 plan
  cluster_1_257_n        TEXT,  -- jam 07-08 actual
  cluster_1_361_n        TEXT,  -- jam 08-09 plan
  cluster_1_362_n        TEXT,  -- jam 08-09 actual
  cluster_1_466_n        TEXT,  -- jam 09-10 plan
  cluster_1_467_n        TEXT,  -- jam 09-10 actual
  cluster_1_571_n        TEXT,  -- jam 10-11 plan
  cluster_1_572_n        TEXT,  -- jam 10-11 actual
  cluster_1_676_n        TEXT,  -- jam 11-12 plan
  cluster_1_677_n        TEXT,  -- jam 11-12 actual
  cluster_1_781_n        TEXT,  -- jam 12-13 plan
  cluster_1_782_n        TEXT,  -- jam 12-13 actual
  cluster_1_886_n        TEXT,  -- jam 13-14 plan
  cluster_1_887_n        TEXT,  -- jam 13-14 actual
  cluster_1_991_n        TEXT,  -- jam 14-15 plan
  cluster_1_992_n        TEXT,  -- jam 14-15 actual
  cluster_1_1096_n       TEXT,  -- jam 15-16 plan
  cluster_1_1097_n       TEXT,  -- jam 15-16 actual
  cluster_1_1201_n       TEXT,  -- jam 16-17 plan
  cluster_1_1202_n       TEXT,  -- jam 16-17 actual
  cluster_1_1306_n       TEXT,  -- jam 17-18 plan
  cluster_1_1307_n       TEXT,  -- jam 17-18 actual
  cluster_1_1411_n       TEXT,  -- jam 18-19 plan
  cluster_1_1412_n       TEXT,  -- jam 18-19 actual
  cluster_1_1516_n       TEXT,  -- jam 19-20 plan
  cluster_1_1517_n       TEXT,  -- jam 19-20 actual
  cluster_1_1621_n       TEXT,  -- jam 20-21 plan
  cluster_1_1622_n       TEXT,  -- jam 20-21 actual
  cluster_1_1726_n       TEXT,  -- jam 21-22 plan
  cluster_1_1727_n       TEXT,  -- jam 21-22 actual
  cluster_1_1831_n       TEXT,  -- jam 22-23 plan
  cluster_1_1832_n       TEXT,  -- jam 22-23 actual
  cluster_1_1936_n       TEXT,  -- jam 23-24 plan
  cluster_1_1937_n       TEXT,  -- jam 23-24 actual
  cluster_1_2041_n       TEXT,  -- jam 24-1 plan
  cluster_1_2042_n       TEXT,  -- jam 24-1 actual
  cluster_1_2146_n       TEXT,  -- jam 01-02 plan
  cluster_1_2147_n       TEXT,  -- jam 01-02 actual
  cluster_1_2251_n       TEXT,  -- jam 02-03 plan
  cluster_1_2252_n       TEXT,  -- jam 02-03 actual
  cluster_1_2356_n       TEXT,  -- jam 03-04 plan
  cluster_1_2357_n       TEXT,  -- jam 03-04 actual
  cluster_1_2461_n       TEXT,  -- jam 04-05 plan
  cluster_1_2462_n       TEXT,  -- jam 04-05 actual
  cluster_1_2566_n       TEXT,  -- jam 05-06 plan
  cluster_1_2567_n       TEXT,  -- jam 05-06 actual
  cluster_1_2671_n       TEXT,  -- jam 06-07 plan
  cluster_1_2672_n       TEXT  -- jam 06-07 actual
);

-- Total kolom: 92
-- =====================================================================
-- DUMMY SEED DATA
-- =====================================================================

INSERT INTO view_report_25290 (
  cluster_1_17_t,
  cluster_1_30_t,
  cluster_1_43_t,
  cluster_1_55_t,
  cluster_1_44_d,
  cluster_1_68_t,
  cluster_1_113_n,
  cluster_1_2913_n,
  cluster_1_2914_n,
  cluster_1_2915_n,
  cluster_1_2917_n,
  cluster_1_2918_n,
  cluster_1_2919_n,
  cluster_1_2797_n,
  cluster_1_2820_n,
  cluster_1_2843_n,
  cluster_1_2866_n,
  cluster_1_85_n,
  cluster_1_7_t,
  cluster_1_8_t,
  cluster_1_12_n,
  cluster_1_13_n,
  cluster_1_20_t,
  cluster_1_21_t,
  cluster_1_25_n,
  cluster_1_26_n,
  cluster_1_33_t,
  cluster_1_34_t,
  cluster_1_38_n,
  cluster_1_39_n,
  cluster_1_45_t,
  cluster_1_46_t,
  cluster_1_50_n,
  cluster_1_51_n,
  cluster_1_57_t,
  cluster_1_58_t,
  cluster_1_62_n,
  cluster_1_63_n,
  cluster_1_69_t,
  cluster_1_70_t,
  cluster_1_74_n,
  cluster_1_75_n,
  cluster_1_151_n,
  cluster_1_152_n,
  cluster_1_256_n,
  cluster_1_257_n,
  cluster_1_361_n,
  cluster_1_362_n,
  cluster_1_466_n,
  cluster_1_467_n,
  cluster_1_571_n,
  cluster_1_572_n,
  cluster_1_676_n,
  cluster_1_677_n,
  cluster_1_781_n,
  cluster_1_782_n,
  cluster_1_886_n,
  cluster_1_887_n,
  cluster_1_991_n,
  cluster_1_992_n,
  cluster_1_1096_n,
  cluster_1_1097_n,
  cluster_1_1201_n,
  cluster_1_1202_n,
  cluster_1_1306_n,
  cluster_1_1307_n,
  cluster_1_1411_n,
  cluster_1_1412_n,
  cluster_1_1516_n,
  cluster_1_1517_n,
  cluster_1_1621_n,
  cluster_1_1622_n,
  cluster_1_1726_n,
  cluster_1_1727_n,
  cluster_1_1831_n,
  cluster_1_1832_n,
  cluster_1_1936_n,
  cluster_1_1937_n,
  cluster_1_2041_n,
  cluster_1_2042_n,
  cluster_1_2146_n,
  cluster_1_2147_n,
  cluster_1_2251_n,
  cluster_1_2252_n,
  cluster_1_2356_n,
  cluster_1_2357_n,
  cluster_1_2461_n,
  cluster_1_2462_n,
  cluster_1_2566_n,
  cluster_1_2567_n,
  cluster_1_2671_n,
  cluster_1_2672_n
) VALUES
('41HR101', 'Emy Chumayani', 'Ardiansyah', 'Sekar Arum Pratiwi', '2026-06-28 09:00:00', 'Shift 1 (2 Shift)', '1696', '2133', '1177', '-956', '2', '480', '340', '0', '0', '14', '126', '88', 'FX2BH-33SA-1.27R(02)', 'PCB ASSY FX2BH', '13.5', '13.3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '267', '267', '230', '267', '260', '267', '250', '267', '245', '267', '255', '267', '261', '267', '267', '267', '246', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '267'),
('41HR101', 'Emy Chumayani', 'Ardiansyah', 'Sekar Arum Pratiwi', '2026-06-28 23:30:00', 'Shift 2 (2 Shift)', '1696', '2133', '1177', '-956', '2', '480', '340', '0', '0', '14', '126', '88', 'FX2BH-33SA-1.27R(02)', 'PCB ASSY FX2BH', '13.5', '13.3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '233', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '240', '267', '255', '267', '230', '267', '248', '267', '252', '267', '260', '267', '245', '267', '250', '267', '233'),
('41HR101', 'Emy Chumayani', 'Ardiansyah', 'Sekar Arum Pratiwi', '2026-06-27 09:00:00', 'Shift 1 (2 Shift)', '1696', '2133', '1177', '-956', '2', '480', '340', '0', '0', '14', '126', '88', 'FX2BH-33SA-1.27R(02)', 'PCB ASSY FX2BH', '13.5', '13.3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '267', '267', '230', '267', '260', '267', '250', '267', '245', '267', '255', '267', '261', '267', '267', '267', '246', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '267'),
('41HR101', 'Emy Chumayani', 'Ardiansyah', 'Sekar Arum Pratiwi', '2026-06-27 23:30:00', 'Shift 2 (2 Shift)', '1696', '2133', '1177', '-956', '2', '480', '340', '0', '0', '14', '126', '88', 'FX2BH-33SA-1.27R(02)', 'PCB ASSY FX2BH', '13.5', '13.3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '233', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '267', '240', '267', '255', '267', '230', '267', '248', '267', '252', '267', '260', '267', '245', '267', '250', '267', '233');
