const express = require("express");
const router = express.Router();
const pool = require("../db");

// ─────────────────────────────────────────────────────────────
//  KONFIGURASI — PCB general (semua line pakai view yang sama,
//  dibedain lewat kolom Line). Line aktif + shift scheme-nya
//  (2/3 shift) disimpan di tabel "lines" (lihat routes/lines.js),
//  BUKAN hardcode — supaya nambah line baru gak perlu deploy ulang.
// ─────────────────────────────────────────────────────────────
const VIEW = "view_report_25290";

const fs = require("fs");
const path = require("path");
const LINES_FILE = path.join(__dirname, "..", "data", "lines.json");

// Ambil config 1 line dari file registry (BUKAN dari DB vendor — lihat
// routes/lines.js buat alasannya). null kalau gak ketemu/nonaktif.
function getLineConfig(lineCode) {
  let lines = [];
  try {
    lines = JSON.parse(fs.readFileSync(LINES_FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
  const found = lines.find((l) => l.line_code === lineCode && l.active);
  return found || null;
}

// ─────────────────────────────────────────────────────────────
//  MAPPING KOLOM
// ─────────────────────────────────────────────────────────────
const COLS = {
  // ⚠️ Row 17 (Line) dikasih type "n" (numeric), tapi value-nya "41HR101"
  // ada hurufnya — gak mungkin kolom numeric. Gua tetep pakai suffix _t
  // di bawah, TAPI INI PALING DICURIGAI jadi sumber 500 error: kalau kolom
  // aslinya beneran cluster_1_17_n (numeric), query bakal error pas coba
  // bandingin ke string '41HR101'. Tolong double check di form ConMas:
  // row 17 itu field text/dropdown, atau ID numeric yang representasiin '41HR101'?
  line: "cluster_1_17_t",
  cell_leader: "cluster_1_30_t",
  teknisi: "cluster_1_43_t",
  inspector: "cluster_1_55_t",
  tanggal: "cluster_1_44_d",
  shift: "cluster_1_68_t",

  reject_ppm: "cluster_1_113_n",
  output_plan: "cluster_1_2913_n",
  output_actual: "cluster_1_2914_n",
  deviasi_target: "cluster_1_2915_n",
  qty_reject: "cluster_1_2917_n",
  stoptime_plan: "cluster_1_2918_n", // "jam plan"
  stoptime_actual: "cluster_1_2919_n", // "jam actual"

  // 4M — row asli udah dikonfirmasi
  stoptime_man: "cluster_1_2797_n",
  stoptime_method: "cluster_1_2820_n",
  stoptime_material: "cluster_1_2843_n",
  stoptime_machine: "cluster_1_2866_n",
  oee: "cluster_1_85_n",
};

// Slot produk 1–6, terisi sekuensial (slot N+1 baru keisi kalau ada Change Model)
const SLOTS = [
  {
    cl_no: "cluster_1_7_t",
    product_name: "cluster_1_8_t",
    swi: "cluster_1_12_n",
    actual: "cluster_1_13_n",
  },
  {
    cl_no: "cluster_1_20_t",
    product_name: "cluster_1_21_t",
    swi: "cluster_1_25_n",
    actual: "cluster_1_26_n",
  },
  {
    cl_no: "cluster_1_33_t",
    product_name: "cluster_1_34_t",
    swi: "cluster_1_38_n",
    actual: "cluster_1_39_n",
  },
  {
    cl_no: "cluster_1_45_t",
    product_name: "cluster_1_46_t",
    swi: "cluster_1_50_n",
    actual: "cluster_1_51_n",
  },
  {
    cl_no: "cluster_1_57_t",
    product_name: "cluster_1_58_t",
    swi: "cluster_1_62_n",
    actual: "cluster_1_63_n",
  },
  {
    cl_no: "cluster_1_69_t",
    product_name: "cluster_1_70_t",
    swi: "cluster_1_74_n",
    actual: "cluster_1_75_n",
  },
];

// Rekapitulasi per jam — 25 slot, 06:00 s.d. 07:00 keesokan harinya.
// Row hanya keisi sesuai jam jalan shift terkait; sisanya NULL (otomatis tampil "—" di FE).
const HOURLY = [
  { label: "06-07", plan: "cluster_1_151_n", actual: "cluster_1_152_n" },
  { label: "07-08", plan: "cluster_1_256_n", actual: "cluster_1_257_n" },
  { label: "08-09", plan: "cluster_1_361_n", actual: "cluster_1_362_n" },
  { label: "09-10", plan: "cluster_1_466_n", actual: "cluster_1_467_n" },
  { label: "10-11", plan: "cluster_1_571_n", actual: "cluster_1_572_n" },
  { label: "11-12", plan: "cluster_1_676_n", actual: "cluster_1_677_n" },
  { label: "12-13", plan: "cluster_1_781_n", actual: "cluster_1_782_n" },
  { label: "13-14", plan: "cluster_1_886_n", actual: "cluster_1_887_n" },
  { label: "14-15", plan: "cluster_1_991_n", actual: "cluster_1_992_n" },
  { label: "15-16", plan: "cluster_1_1096_n", actual: "cluster_1_1097_n" },
  { label: "16-17", plan: "cluster_1_1201_n", actual: "cluster_1_1202_n" },
  { label: "17-18", plan: "cluster_1_1306_n", actual: "cluster_1_1307_n" },
  { label: "18-19", plan: "cluster_1_1411_n", actual: "cluster_1_1412_n" },
  { label: "19-20", plan: "cluster_1_1516_n", actual: "cluster_1_1517_n" },
  { label: "20-21", plan: "cluster_1_1621_n", actual: "cluster_1_1622_n" },
  { label: "21-22", plan: "cluster_1_1726_n", actual: "cluster_1_1727_n" },
  { label: "22-23", plan: "cluster_1_1831_n", actual: "cluster_1_1832_n" },
  { label: "23-24", plan: "cluster_1_1936_n", actual: "cluster_1_1937_n" },
  { label: "24-1", plan: "cluster_1_2041_n", actual: "cluster_1_2042_n" },
  { label: "01-02", plan: "cluster_1_2146_n", actual: "cluster_1_2147_n" },
  { label: "02-03", plan: "cluster_1_2251_n", actual: "cluster_1_2252_n" },
  { label: "03-04", plan: "cluster_1_2356_n", actual: "cluster_1_2357_n" },
  { label: "04-05", plan: "cluster_1_2461_n", actual: "cluster_1_2462_n" },
  { label: "05-06", plan: "cluster_1_2566_n", actual: "cluster_1_2567_n" },
  { label: "06-07", plan: "cluster_1_2671_n", actual: "cluster_1_2672_n" },
];

// ─────────────────────────────────────────────────────────────
//  LOGIC SHIFT — generic per shift_scheme (2 atau 3)
//
//  2 Shift: Shift 1: 07:00–16:00 (Jumat s.d. 17:00)
//           Shift 2: 22:00–07:00
//           Jam 16/17:00–22:00 = gap (gak ada shift jalan) → default
//           tampilkan Shift 1 (data terakhir yg baru selesai).
//
//  3 Shift: Shift 1: 06:00–14:00
//           Shift 2: 14:00–22:00
//           Shift 3: 22:00–06:00
//           Gak ada gap — selalu ada shift yang lagi jalan.
//
//  ⚠️ Value kolom `shift` di DB bentuknya "Shift 1 (2 Shift)",
//  "Shift 2 (3 Shift)", dst — ada suffix scheme.
// ─────────────────────────────────────────────────────────────

function resolveShiftAndDate(nowWIB, scheme) {
  const dow = nowWIB.getUTCDay(); // 0=Min ... 5=Jumat
  const hour = nowWIB.getUTCHours();
  let shiftNum;
  let useYesterday = false;
  let startHour;

  if (scheme === 3) {
    if (hour >= 6 && hour < 14) {
      shiftNum = 1;
      startHour = 6;
    } else if (hour >= 14 && hour < 22) {
      shiftNum = 2;
      startHour = 14;
    } else {
      // 22:00–23:59 ATAU 00:00–05:59 → Shift 3
      shiftNum = 3;
      startHour = 22;
      if (hour < 6) useYesterday = true; // tengah malam, row-nya tanggal kemarin
    }
  } else {
    // default: 2 shift
    const shift1End = dow === 5 ? 17 : 16;
    if (hour >= 7 && hour < shift1End) {
      shiftNum = 1;
      startHour = 7;
    } else if (hour >= 22 || hour < 7) {
      shiftNum = 2;
      startHour = 22;
      if (hour < 7) useYesterday = true;
    } else {
      shiftNum = 1; // gap → tampilkan hasil shift 1 yang baru kelar
      startHour = 7;
    }
  }

  const shift = `Shift ${shiftNum} (${scheme} Shift)`;

  // Tanggal "kalender" buat row di DB (shift yang lewat tengah malam
  // dicatat di tanggal kemarin).
  const baseDate = useYesterday
    ? new Date(nowWIB.getTime() - 86_400_000)
    : nowWIB;
  const tanggal = baseDate.toISOString().slice(0, 10);

  // Instant (jam:menit) persis kapan shift ini mulai — dipakai buat
  // hitung "udah berapa lama shift jalan tapi row-nya belum ada".
  const shiftStartWIB = new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      startHour,
      0,
      0
    )
  );

  return { shift, tanggal, shiftStartWIB };
}

// Line dianggap "TIDAK RUNNING" kalau row buat shift aktif belum ada
// SAMA SEKALI, padahal udah lewat >60 menit dari jam mulai shift.
// Di bawah 60 menit pertama dianggap wajar (operator belum sempat
// input/submit form), jadi gak di-flag.
const NOT_RUNNING_THRESHOLD_MIN = 60;

function isLineNotRunning(nowWIB, shiftStartWIB) {
  const elapsedMin = (nowWIB.getTime() - shiftStartWIB.getTime()) / 60_000;
  return elapsedMin > NOT_RUNNING_THRESHOLD_MIN;
}

// ─────────────────────────────────────────────────────────────
//  GET /?line=... — data shift aktif untuk line yang diminta
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const lineCode = (req.query.line || "").trim();
    if (!lineCode) {
      return res.status(400).json({
        success: false,
        message: "Parameter ?line= wajib diisi. Cek GET /api/lines buat daftar line yang valid.",
      });
    }

    const lineConfig = await getLineConfig(lineCode);
    if (!lineConfig) {
      return res.status(404).json({
        success: false,
        message: `Line "${lineCode}" tidak ditemukan / nonaktif. Cek GET /api/lines.`,
      });
    }

    const wib = new Date(Date.now() + 7 * 3600 * 1000);
    const { shift, tanggal: targetDate, shiftStartWIB } = resolveShiftAndDate(wib, lineConfig.shift_scheme);
    const lineNotRunning = isLineNotRunning(wib, shiftStartWIB);

    const slotSelects = SLOTS.flatMap((s, i) => [
      `${s.cl_no} AS slot_${i}_cl_no`,
      `${s.product_name} AS slot_${i}_product`,
      `${s.swi} AS slot_${i}_swi`,
      `${s.actual} AS slot_${i}_actual`,
    ]);
    const hourlySelects = HOURLY.flatMap((h) => [
      `${h.plan} AS hour_${h.label.replace(/-/g, "_")}_plan`,
      `${h.actual} AS hour_${h.label.replace(/-/g, "_")}_actual`,
    ]);

    const query = `
      SELECT
        ${COLS.line} AS line,
        ${COLS.cell_leader} AS cell_leader,
        ${COLS.teknisi} AS teknisi,
        ${COLS.inspector} AS inspector,
        ${COLS.tanggal} AS tanggal,
        ${COLS.shift} AS shift,
        ${COLS.reject_ppm} AS reject_ppm,
        ${COLS.output_plan} AS output_plan,
        ${COLS.output_actual} AS output_actual,
        ${COLS.deviasi_target} AS deviasi_target,
        ${COLS.qty_reject} AS qty_reject,
        ${COLS.stoptime_plan} AS stoptime_plan,
        ${COLS.stoptime_actual} AS stoptime_actual,
        ${COLS.stoptime_man} AS stoptime_man,
        ${COLS.stoptime_machine} AS stoptime_machine,
        ${COLS.stoptime_material} AS stoptime_material,
        ${COLS.stoptime_method} AS stoptime_method,
        ${COLS.oee} AS oee,
        ${slotSelects.join(",\n        ")},
        ${hourlySelects.join(",\n        ")}
      FROM ${VIEW}
      WHERE ${COLS.line} = $1
        AND ${COLS.shift} = $2
        AND DATE(${COLS.tanggal} AT TIME ZONE 'Asia/Jakarta') = $3
      LIMIT 1
    `;

    const result = await pool.query(query, [lineCode, shift, targetDate]);
    const row = result.rows[0] || null;

    if (!row) {
      return res.json({
        success: true,
        data: null,
        line: lineCode,
        shift,
        tanggal: targetDate,
        line_not_running: lineNotRunning,
      });
    }

    // ── Slot aktif: ambil slot terakhir yg cl_no-nya keisi ──
    let activeSlot = null;
    for (let i = 0; i < SLOTS.length; i++) {
      if (row[`slot_${i}_cl_no`]) {
        activeSlot = {
          cl_no: row[`slot_${i}_cl_no`],
          product_name: row[`slot_${i}_product`],
          cycle_time_swi:
            row[`slot_${i}_swi`] != null ? Number(row[`slot_${i}_swi`]) : null,
          cycle_time_actual:
            row[`slot_${i}_actual`] != null
              ? Number(row[`slot_${i}_actual`])
              : null,
        };
      }
    }

    // ── Hourly array (dipakai langsung, gak perlu endpoint /trend lagi) ──
    const hourly = HOURLY.map((h) => {
      const key = h.label.replace(/-/g, "_");
      const plan =
        row[`hour_${key}_plan`] != null
          ? Number(row[`hour_${key}_plan`])
          : null;
      const actual =
        row[`hour_${key}_actual`] != null
          ? Number(row[`hour_${key}_actual`])
          : null;
      return {
        slot: h.label,
        output_plan: plan,
        output_actual: actual,
        deviasi: plan != null && actual != null ? actual - plan : null,
        pencapaian:
          plan > 0 && actual != null ? Math.round((actual / plan) * 100) : null,
      };
    });

    const stoptime_total =
      row.stoptime_plan != null && row.stoptime_actual != null
        ? Number(row.stoptime_plan) - Number(row.stoptime_actual)
        : 0;

    res.json({
      success: true,
      shift,
      tanggal: targetDate,
      line_not_running: false,
      line: row.line,
      cell_leader_nama: row.cell_leader,
      pj_teknis_nama: row.teknisi,
      inspector_nama: row.inspector,
      product_name: activeSlot?.product_name || null,
      cl_no: activeSlot?.cl_no || null,
      cycle_time_swi: activeSlot?.cycle_time_swi ?? null,
      cycle_time_actual: activeSlot?.cycle_time_actual ?? null,
      output_plan: Number(row.output_plan) || 0,
      output_total: Number(row.output_actual) || 0,
      deviasi_target:
        (Number(row.output_actual) || 0) - (Number(row.output_plan) || 0),
      reject_qty: Number(row.qty_reject) || 0,
      qty_reject_ppm: Number(row.reject_ppm) || 0,
      stoptime_total,
      stoptime_man: Number(row.stoptime_man) || 0,
      stoptime_machine: Number(row.stoptime_machine) || 0,
      stoptime_material: Number(row.stoptime_material) || 0,
      stoptime_method: Number(row.stoptime_method) || 0,
      oee: row.oee != null ? Number(row.oee) : null,
      hourly,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error query dashboard:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal ambil data",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /monthly?line=... — akumulasi reject & output sebulan
//  (gabung semua shift, karena qty_reject ada di tiap row)
// ─────────────────────────────────────────────────────────────
router.get("/monthly", async (req, res) => {
  try {
    const lineCode = (req.query.line || "").trim();
    if (!lineCode) {
      return res.status(400).json({ success: false, message: "Parameter ?line= wajib diisi." });
    }

    const wib = new Date(Date.now() + 7 * 3600 * 1000);
    const year = wib.getUTCFullYear();
    const month = wib.getUTCMonth() + 1;

    const query = `
      SELECT
        SUM(CAST(${COLS.qty_reject} AS NUMERIC)) AS total_reject,
        SUM(CAST(${COLS.output_actual} AS NUMERIC)) AS total_output,
        SUM(CAST(${COLS.stoptime_man} AS NUMERIC)) AS total_man,
        SUM(CAST(${COLS.stoptime_machine} AS NUMERIC)) AS total_machine,
        SUM(CAST(${COLS.stoptime_material} AS NUMERIC)) AS total_material,
        SUM(CAST(${COLS.stoptime_method} AS NUMERIC)) AS total_method
      FROM ${VIEW}
      WHERE ${COLS.line} = $1
        AND EXTRACT(YEAR FROM (${COLS.tanggal} AT TIME ZONE 'Asia/Jakarta')) = $2
        AND EXTRACT(MONTH FROM (${COLS.tanggal} AT TIME ZONE 'Asia/Jakarta')) = $3
    `;
    const result = await pool.query(query, [lineCode, year, month]);
    const total_output = Number(result.rows[0]?.total_output) || 0;
    const total_reject = Number(result.rows[0]?.total_reject) || 0;
    const ppm =
      total_output > 0
        ? Math.round((total_reject / total_output) * 1_000_000)
        : 0;

    res.json({
      total_qty_reject: total_reject,
      total_output,
      ppm,
      man: Number(result.rows[0]?.total_man) || 0,
      machine: Number(result.rows[0]?.total_machine) || 0,
      material: Number(result.rows[0]?.total_material) || 0,
      method: Number(result.rows[0]?.total_method) || 0,
    });
  } catch (err) {
    console.error("MONTHLY ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /reject-detail?line=...&date=YYYY-MM-DD — belum ada kolom
//  reject-per-jenis di DB, tetap return array kosong (FE jatuh ke
//  default defect list). Parameter ?line= diterima buat konsistensi
//  kontrak API begitu kolomnya udah ada nanti.
// ─────────────────────────────────────────────────────────────
router.get("/reject-detail", async (req, res) => {
  const wib = new Date(Date.now() + 7 * 3600 * 1000);
  const targetDate = req.query.date || wib.toISOString().slice(0, 10);
  res.json({ success: true, date: targetDate, data: [] });
});

module.exports = router;