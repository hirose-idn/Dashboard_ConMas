const express = require("express");
const router = express.Router();
const pool = require("../db");

// ─────────────────────────────────────────────────────────────
//  KOLOM TOTAL AKHIR SHIFT
// ─────────────────────────────────────────────────────────────
const SHIFT1_COLS = {
  output: "cluster_1_523_n", // row 9  — Output Produksi
  output_plan: "cluster_1_468_n", // row 8  — Output Plan (target shift 1 = kolom 468)
  reject: "cluster_1_516_n", // row 13 — Qty Reject
  stoptime_total: "cluster_1_529_n", // row 12 — Stoptime total (menit)
  stoptime_man: "cluster_1_533_n",
  stoptime_machine: "cluster_1_531_n",
  stoptime_material: "cluster_1_535_n",
  stoptime_other: "cluster_1_543_n",
  cycle_time_swi: "cluster_1_70_n", // row 6  — Cycle Time SWI (detik)
  cycle_time_actual: "cluster_1_72_n", // row 7  — Cycle Time Actual (detik)
  cl_no: "cluster_1_7_t", // row 2  — Line
  product_name: "cluster_1_8_t",
  line: "cluster_1_12_t", // row 3  — Nama Produk
  cell_leader_nama: "cluster_1_33_t", // row 4  — Cell Leader
  pj_teknis_nama: "cluster_1_496_t", // row 5  — PJ Teknisi (Shift 1)
  inspector_nama: "cluster_1_497_t", // row 5  — PJ Teknisi (Shift 1)
};

// Shift 1 Jumat — slot terakhir adalah 14-15 (bukan 15-16), kolom beda
// output plan  = cluster_1_419_n (slot 14-15 cum plan)
// output aktual = cluster_1_421_n (slot 14-15 cum actual)
const SHIFT1_JUMAT_COLS = {
  output: "cluster_1_421_n", // row 9  — Output Produksi Jumat (slot 14-15 actual)
  output_plan: "cluster_1_419_n", // row 8  — Output Plan Jumat (slot 14-15 cum plan)
  reject: "cluster_1_516_n", // row 13 — Qty Reject
  stoptime_total: "cluster_1_529_n", // row 12 — Stoptime total
  stoptime_man: "cluster_1_533_n",
  stoptime_machine: "cluster_1_531_n",
  stoptime_material: "cluster_1_535_n",
  stoptime_other: "cluster_1_543_n",
  cycle_time_swi: "cluster_1_70_n", // row 6  — Cycle Time SWI
  cycle_time_actual: "cluster_1_72_n", // row 7  — Cycle Time Actual
  cl_no: "cluster_1_7_t", // row 2  — Line
  product_name: "cluster_1_8_t",
  line: "cluster_1_12_t", // row 3  — Nama Produk
  cell_leader_nama: "cluster_1_33_t", // row 4  — Cell Leader
  pj_teknis_nama: "cluster_1_545_t", // row 5  — PJ Teknisi (Shift 1)
  inspector_nama: "cluster_1_546_t", // row 5  — PJ Teknisi (Shift 1)
};

// Shift 2 — output plan pakai kolom 419 (akhir P8, ekuivalen 480 menit efektif)
const SHIFT2_COLS = {
  output: "cluster_1_474_n",
  output_plan: "cluster_1_419_n", // row 8 shift 2
  reject: "cluster_1_467_n",
  stoptime_total: "cluster_1_480_n",
  stoptime_man: "cluster_1_484_n",
  stoptime_machine: "cluster_1_482_n",
  stoptime_material: "cluster_1_486_n",
  stoptime_other: "cluster_1_494_n",
  cycle_time_swi: "cluster_1_70_n",
  cycle_time_actual: "cluster_1_72_n",
  line: "cluster_1_12_t",
  cl_no: "cluster_1_7_t",
  product_name: "cluster_1_8_t",
  cell_leader_nama: "cluster_1_33_t",
  pj_teknis_nama: "cluster_1_545_t", // row 5  — PJ Teknisi (Shift 2)
  inspector_nama: "cluster_1_546_t",
};

// ─────────────────────────────────────────────────────────────
//  PERIODE REKAPITULASI PER JAM
//  Nilai adalah kumulatif aktual dari awal shift.
//  plan_col  = kolom Output Plan kumulatif s.d periode tsb
//  actual_col = plan_col + 2 (pola dari backend lama)
// ─────────────────────────────────────────────────────────────
const TREND_PERIODS = {
  // Shift 1 — Senin s.d. Kamis (view 13459)
  13459: [
    {
      label: "07-08",
      plan_col: "cluster_1_76_n",
      actual_col: "cluster_1_78_n",
      cum_eff_min: 60,
    },
    {
      label: "08-09",
      plan_col: "cluster_1_125_n",
      actual_col: "cluster_1_127_n",
      cum_eff_min: 120,
    },
    {
      label: "09-10",
      plan_col: "cluster_1_174_n",
      actual_col: "cluster_1_176_n",
      cum_eff_min: 180,
    },
    {
      label: "10-11",
      plan_col: "cluster_1_223_n",
      actual_col: "cluster_1_225_n",
      cum_eff_min: 205,
    },
    {
      label: "11-12",
      plan_col: "cluster_1_272_n",
      actual_col: "cluster_1_274_n",
      cum_eff_min: 265,
    },
    {
      label: "12-13",
      plan_col: "cluster_1_321_n",
      actual_col: "cluster_1_323_n",
      cum_eff_min: 310,
    },
    {
      label: "13-14",
      plan_col: "cluster_1_370_n",
      actual_col: "cluster_1_372_n",
      cum_eff_min: 370,
    },
    {
      label: "14-15",
      plan_col: "cluster_1_419_n",
      actual_col: "cluster_1_421_n",
      cum_eff_min: 430,
    },
    {
      label: "15-16",
      plan_col: "cluster_1_468_n",
      actual_col: "cluster_1_470_n",
      cum_eff_min: 480,
    },
  ],
  // Shift 1 — Jumat (view 13460)
  13460: [
    {
      label: "07-08",
      plan_col: "cluster_1_76_n",
      actual_col: "cluster_1_78_n",
      cum_eff_min: 60,
    },
    {
      label: "08-09",
      plan_col: "cluster_1_125_n",
      actual_col: "cluster_1_127_n",
      cum_eff_min: 120,
    },
    {
      label: "09-10",
      plan_col: "cluster_1_174_n",
      actual_col: "cluster_1_176_n",
      cum_eff_min: 180,
    },
    {
      label: "10-11",
      plan_col: "cluster_1_223_n",
      actual_col: "cluster_1_225_n",
      cum_eff_min: 205,
    },
    {
      label: "11-12",
      plan_col: "cluster_1_272_n",
      actual_col: "cluster_1_274_n",
      cum_eff_min: 265,
    },
    {
      label: "12-13",
      plan_col: "cluster_1_321_n",
      actual_col: "cluster_1_323_n",
      cum_eff_min: 295,
    },
    {
      label: "13-14",
      plan_col: "cluster_1_370_n",
      actual_col: "cluster_1_372_n",
      cum_eff_min: 355,
    },
    {
      label: "14-15",
      plan_col: "cluster_1_419_n",
      actual_col: "cluster_1_421_n",
      cum_eff_min: 445,
    },
    // Shift 1 Jumat tidak ada slot 15-16
  ],
  // Shift 2 (view 13461) mulai 22:00
  13461: [
    {
      label: "22-23",
      plan_col: "cluster_1_76_n",
      actual_col: "cluster_1_78_n",
      cum_eff_min: 60,
    },
    {
      label: "23-00",
      plan_col: "cluster_1_125_n",
      actual_col: "cluster_1_127_n",
      cum_eff_min: 120,
    },
    {
      label: "00-01",
      plan_col: "cluster_1_174_n",
      actual_col: "cluster_1_176_n",
      cum_eff_min: 165,
    },
    {
      label: "01-02",
      plan_col: "cluster_1_223_n",
      actual_col: "cluster_1_225_n",
      cum_eff_min: 225,
    },
    {
      label: "02-04",
      plan_col: "cluster_1_272_n",
      actual_col: "cluster_1_274_n",
      cum_eff_min: 315,
    },
    {
      label: "04-05",
      plan_col: "cluster_1_321_n",
      actual_col: "cluster_1_323_n",
      cum_eff_min: 375,
    },
    {
      label: "05-06",
      plan_col: "cluster_1_370_n",
      actual_col: "cluster_1_372_n",
      cum_eff_min: 420,
    },
    {
      label: "06-07",
      plan_col: "cluster_1_419_n",
      actual_col: "cluster_1_421_n",
      cum_eff_min: 480,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  HELPER — bangun SELECT query utama
// ─────────────────────────────────────────────────────────────
async function getViewColumns(pool, viewName) {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
    [viewName],
  );
  return new Set(res.rows.map((r) => r.column_name));
}

async function buildSelectQuery(pool, view, cols, shiftLabel, dowFilter) {
  const existingCols = await getViewColumns(pool, view);
  const safeCol = (col, alias, fallback = "NULL") =>
    existingCols.has(col) ? `${col} AS ${alias}` : `${fallback} AS ${alias}`;

  const whereClause = dowFilter
    ? `WHERE EXTRACT(ISODOW FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = ANY(ARRAY[${dowFilter}])`
    : "";
  return `
    SELECT
      '${shiftLabel}'             AS shift,
      cluster_1_11_d              AS tanggal,
      ${safeCol(cols.cl_no, "cl_no")}           ,
      ${safeCol(cols.product_name, "product_name")}    ,
      ${safeCol(cols.cell_leader_nama, "cell_leader_nama")},
      ${safeCol(cols.output, "output_total", "0")},
      ${safeCol(cols.output_plan, "output_plan", "0")},
      ${safeCol(cols.reject, "reject_qty", "0")},
      ${safeCol(cols.stoptime_total, "stoptime_total", "0")},
      ${safeCol(cols.stoptime_man, "stoptime_man", "0")},
      ${safeCol(cols.stoptime_machine, "stoptime_machine", "0")},
      ${safeCol(cols.stoptime_material, "stoptime_material", "0")},
      0                                                        AS stoptime_method,
      ${safeCol(cols.stoptime_other, "stoptime_other", "0")},
      ${safeCol(cols.cycle_time_swi, "cycle_time_swi", "NULL")},
      ${safeCol(cols.cycle_time_actual, "cycle_time_actual", "NULL")},
      ${safeCol(cols.pj_teknis_nama, "pj_teknis_nama", "NULL")}
    FROM ${view}
    ${whereClause}
  `;
}

// ─────────────────────────────────────────────────────────────
//  GET /  — data harian lengkap
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [q1, q2, q3] = await Promise.all([
      buildSelectQuery(
        pool,
        "view_report_13459",
        SHIFT1_COLS,
        "Shift 1",
        "1,2,3,4",
      ),
      buildSelectQuery(
        pool,
        "view_report_13460",
        SHIFT1_JUMAT_COLS,
        "Shift 1",
        "5",
      ),
      buildSelectQuery(pool, "view_report_13461", SHIFT2_COLS, "Shift 2", null),
    ]);
    const query = `${q1} UNION ALL ${q2} UNION ALL ${q3} ORDER BY tanggal ASC`;
    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
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
//  GET /summary
// ─────────────────────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  try {
    const [sq1, sq2, sq3] = await Promise.all([
      buildSelectQuery(
        pool,
        "view_report_13459",
        SHIFT1_COLS,
        "Shift 1",
        "1,2,3,4",
      ),
      buildSelectQuery(
        pool,
        "view_report_13460",
        SHIFT1_JUMAT_COLS,
        "Shift 1",
        "5",
      ),
      buildSelectQuery(pool, "view_report_13461", SHIFT2_COLS, "Shift 2", null),
    ]);
    const query = `
      SELECT
        shift,
        MAX(cl_no)               AS cl_no,
        MAX(product_name)        AS product_name,
        SUM(output_total)        AS output_total,
        SUM(output_plan)         AS output_plan,
        SUM(reject_qty)          AS reject_qty,
        SUM(stoptime_total)      AS stoptime_total,
        SUM(stoptime_man)        AS stoptime_man,
        SUM(stoptime_machine)    AS stoptime_machine,
        SUM(stoptime_material)   AS stoptime_material,
        SUM(stoptime_method)     AS stoptime_method,
        SUM(stoptime_other)      AS stoptime_other,
        AVG(cycle_time_swi)      AS cycle_time_swi,
        AVG(cycle_time_actual)   AS cycle_time_actual
      FROM (
        ${sq1} UNION ALL ${sq2} UNION ALL ${sq3}
      ) combined
      GROUP BY shift
      ORDER BY shift ASC
    `;
    const result = await pool.query(query);
    const shift1 = result.rows.find((r) => r.shift === "Shift 1") || {};
    const shift2 = result.rows.find((r) => r.shift === "Shift 2") || {};
    res.json({
      success: true,
      shift1,
      shift2,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error query summary:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal ambil summary",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /trend?date=YYYY-MM-DD
//  Kembalikan tren kumulatif per-periode untuk hari ini
//  Response: { shift1: [{label, cum_eff_min, output_plan, output_actual, deviasi}], shift2: [...] }
// ─────────────────────────────────────────────────────────────
router.get("/trend", async (req, res) => {
  try {
    let targetDate = req.query.date;
    if (!targetDate) {
      const wib = new Date(new Date().getTime() + 7 * 3600 * 1000);
      targetDate = wib.toISOString().slice(0, 10);
    }

    // Pilih view Shift 1 berdasarkan hari (Jumat=5 → 13460, lainnya → 13459)
    const dowRow = await pool.query(
      `SELECT EXTRACT(ISODOW FROM $1::date) AS dow`,
      [targetDate],
    );
    const dow = Number(dowRow.rows[0]?.dow ?? 1);
    const s1ViewId = dow === 5 ? "13460" : "13459";

    const s1Periods = TREND_PERIODS[s1ViewId];
    const s2Periods = TREND_PERIODS["13461"];

    // Ambil semua kolom plan + actual sekaligus (1 row per hari)
    const s1Cols = s1Periods
      .flatMap((p) => [p.plan_col, p.actual_col])
      .join(", ");
    const s2Cols = s2Periods
      .flatMap((p) => [p.plan_col, p.actual_col])
      .join(", ");

    const [s1Res, s2Res] = await Promise.all([
      pool.query(
        `SELECT ${s1Cols} FROM view_report_${s1ViewId}
         WHERE DATE(cluster_1_11_d AT TIME ZONE 'Asia/Jakarta') = $1 LIMIT 1`,
        [targetDate],
      ),
      pool.query(
        `SELECT ${s2Cols} FROM view_report_13461
         WHERE DATE(cluster_1_11_d AT TIME ZONE 'Asia/Jakarta') = $1 LIMIT 1`,
        [targetDate],
      ),
    ]);

    const buildTrend = (periods, row) =>
      periods.map((p) => {
        const plan =
          row && row[p.plan_col] != null ? Number(row[p.plan_col]) : null;
        const actual =
          row && row[p.actual_col] != null ? Number(row[p.actual_col]) : null;
        const deviasi = plan != null && actual != null ? actual - plan : null;
        return {
          label: p.label,
          cum_eff_min: p.cum_eff_min,
          output_plan: plan,
          output_actual: actual,
          deviasi,
          pencapaian:
            plan != null && plan > 0 && actual != null
              ? Math.round((actual / plan) * 100)
              : null,
        };
      });

    res.json({
      success: true,
      date: targetDate,
      shift1: buildTrend(s1Periods, s1Res.rows[0] || null),
      shift2: buildTrend(s2Periods, s2Res.rows[0] || null),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error query trend:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal ambil tren",
      error: error.message,
    });
  }
});

// Endpoint akumulasi bulanan
router.get("/monthly", async (req, res) => {
  try {
    // Gunakan WIB untuk menentukan bulan & tahun yang aktif
    const wib = new Date(new Date().getTime() + 7 * 3600 * 1000);
    const year = wib.getUTCFullYear();
    const month = wib.getUTCMonth() + 1;

    // Shift 1 — gabungan view Senin-Kamis (13459) + Jumat (13460)
    const sqlS1 = `
      SELECT
        SUM(CAST(cluster_1_516_n AS NUMERIC)) AS total_reject,
        SUM(CAST(output_col AS NUMERIC)) AS total_output
      FROM (
        SELECT cluster_1_516_n, cluster_1_523_n AS output_col FROM view_report_13459
        WHERE EXTRACT(YEAR  FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $1
          AND EXTRACT(MONTH FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $2
        UNION ALL
        -- Jumat: output aktual ada di cluster_1_421_n (slot 14-15), bukan 523
        SELECT cluster_1_516_n, cluster_1_421_n AS output_col FROM view_report_13460
        WHERE EXTRACT(YEAR  FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $1
          AND EXTRACT(MONTH FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $2
      ) s1
    `;

    // Shift 2 — view 13461
    const sqlS2 = `
      SELECT
        SUM(CAST(cluster_1_467_n AS NUMERIC)) AS total_reject,
        SUM(CAST(cluster_1_474_n AS NUMERIC)) AS total_output
      FROM view_report_13461
      WHERE EXTRACT(YEAR  FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $1
        AND EXTRACT(MONTH FROM (cluster_1_11_d AT TIME ZONE 'Asia/Jakarta')) = $2
    `;

    const [resS1, resS2] = await Promise.all([
      pool.query(sqlS1, [year, month]),
      pool.query(sqlS2, [year, month]),
    ]);

    const total_output =
      (Number(resS1.rows[0]?.total_output) || 0) +
      (Number(resS2.rows[0]?.total_output) || 0);

    const total_reject =
      (Number(resS1.rows[0]?.total_reject) || 0) +
      (Number(resS2.rows[0]?.total_reject) || 0);

    const ppm =
      total_output > 0
        ? Math.round((total_reject / total_output) * 1_000_000)
        : 0;

    res.json({ total_qty_reject: total_reject, total_output, ppm });
  } catch (err) {
    console.error("MONTHLY ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /reject-detail?date=YYYY-MM-DD
//  Kembalikan detail reject per jenis cacat untuk hari ini
//  Format response: { data: [{ defect_name, qty }] }
//
//  CATATAN: Endpoint ini siap dipakai ketika kolom reject per
//  jenis cacat sudah tersedia di DB. Saat ini mengembalikan
//  array kosong → frontend akan tampilkan default defect list.
//  Sesuaikan query SQL di bawah ketika kolom sudah ada.
// ─────────────────────────────────────────────────────────────
router.get("/reject-detail", async (req, res) => {
  try {
    const wib = new Date(new Date().getTime() + 7 * 3600 * 1000);
    const targetDate = req.query.date || wib.toISOString().slice(0, 10);

    // TODO: Ganti query di bawah dengan kolom aktual dari DB ketika sudah tersedia
    // Contoh struktur yang diharapkan frontend:
    // [
    //   { defect_name: "Bent Pins",       qty: 0 },
    //   { defect_name: "Solder Short",    qty: 2 },
    //   { defect_name: "Missing Part",    qty: 0 },
    //   { defect_name: "Surface Scratch", qty: 1 },
    //   { defect_name: "Polarity Reverse",qty: 0 },
    //   { defect_name: "Cold Solder",     qty: 0 },
    // ]
    //
    // Untuk sementara kembalikan array kosong supaya
    // frontend pakai default defect list dengan qty 0.
    const data = [];

    res.json({ success: true, date: targetDate, data });
  } catch (err) {
    console.error("REJECT DETAIL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
