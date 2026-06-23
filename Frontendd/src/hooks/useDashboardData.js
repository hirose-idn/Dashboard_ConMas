import { useState, useEffect, useCallback } from "react";
import {
  BASE_URL,
  REFRESH_MS,
  MOCK_DATA,
  FOTO_BASE_URL,
} from "../config/constants";
import { getTodayWIB, toWIBDateStr, getActiveShift } from "../config/utils";

// ─── Status integrasi per field (sesuai Excel mapping) ───────
// ✅ row 1  tanggal              → cluster_1_11_d
// ✅ row 2  cl_no (kode line)      → cluster_1_7_t
// ✅ row 3  line (nama line)       → cluster_1_12_t
// ✅ row 3  nama_produk          → cluster_1_8_t (product_name)
// ✅ row 4  cell_leader          → cluster_1_33_t (cell_leader_nama)
// ✅ row 5  pj_teknis            → cluster_1_496_t (S1) / cluster_1_545_t (S2)
// ✅ row 5  inspector            → cluster_1_497_t (S1) / cluster_1_546_t (S2)
// ✅ row 6  cycle_time_swi       → cluster_1_70_n
// ✅ row 7  cycle_time_actual    → cluster_1_72_n
// ✅ row 8  output_plan          → cluster_1_468_n (S1) / cluster_1_419_n (S2)
// ✅ row 9  output_produksi      → cluster_1_523_n (S1) / cluster_1_474_n (S2)
// ✅ row 10 deviasi_target       → dihitung: output_produksi - output_plan
// 🟡 row 11 qty_reject_ppm bulan → hold (ppm shift berjalan dihitung lokal)
// ✅ row 12 stoptime_menit       → cluster_1_529_n (S1) / cluster_1_480_n (S2)
// ✅ row 13 qty_reject           → cluster_1_516_n (S1) / cluster_1_467_n (S2)
// 🟡 row 14 total_qty_reject 1bln→ hold
// 🟡 row 15 proses_bermasalah    → hold
// ✅ row 16-47 hourly rekapitulasi → dari /api/dashboard/trend
// 🟡 reject_detail              → dari /api/dashboard/reject-detail (kalau sudah ada)
// ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  // ── Live ──────────────────────────────────────────
  tanggal: null,
  line: null,
  cl_no: null,
  nama_produk: null,
  cell_leader_nama: null,
  cycle_time_swi: null,
  cycle_time_actual: null,
  output_plan: 0,
  output_produksi: 0,
  deviasi_target: 0,
  qty_reject: 0,
  qty_reject_ppm: 0, // dihitung lokal dari shift berjalan
  stoptime_menit: 0,
  hourly: [], // dari /trend endpoint
  trend_s1: [],
  trend_s2: [],
  // ── Mock ──────────────────────────────────────────
  ...MOCK_DATA,
  personnel: {
    ketua: { nama: null, no_karyawan: null, telp: null, foto: null },
    ...MOCK_DATA.personnel,
  },
  reject_detail: MOCK_DATA.reject_detail,
  preventive_maintenance: MOCK_DATA.preventive_maintenance,
  // ── State ─────────────────────────────────────────
  lastRefresh: null,
  loading: true,
  error: null,
};

// Parse field "NIK,Nama" dari DB → { nik, nama }
function parsePersonnelField(raw) {
  if (!raw) return { nik: null, nama: null };
  const parts = String(raw).split(",");
  if (parts.length >= 2)
    return { nik: parts[0].trim(), nama: parts.slice(1).join(",").trim() };
  return /^\d+$/.test(raw.trim())
    ? { nik: raw.trim(), nama: null }
    : { nik: null, nama: raw.trim() };
}

function buildFotoUrl(nik) {
  if (!nik) return null;
  return `${FOTO_BASE_URL}/${nik}.jpg`;
}

export default function useDashboardData() {
  const [state, setState] = useState(INITIAL_STATE);

  const refresh = useCallback(async () => {
    try {
      const today = getTodayWIB();

      // Fetch semua endpoint sekaligus — reject-detail pakai try-catch terpisah
      // karena endpoint ini mungkin belum ada di backend
      const [dataRes, trendRes, monthlyRes] = await Promise.all([
        fetch(`${BASE_URL}/api/dashboard`),
        fetch(`${BASE_URL}/api/dashboard/trend?date=${today}`),
        fetch(`${BASE_URL}/api/dashboard/monthly`),
      ]);

      if (!dataRes.ok)
        throw new Error(`/api/dashboard: HTTP ${dataRes.status}`);
      if (!trendRes.ok)
        throw new Error(`/api/dashboard/trend: HTTP ${trendRes.status}`);
      if (!monthlyRes.ok)
        throw new Error(`/api/dashboard/monthly: HTTP ${monthlyRes.status}`);

      const { data: rows = [] } = await dataRes.json();
      const trendJson = await trendRes.json();
      const monthlyJson = await monthlyRes.json();

      // Fetch reject-detail — optional, tidak crash kalau endpoint belum ada
      let rejectDetailData = null;
      try {
        const rejectRes = await fetch(
          `${BASE_URL}/api/dashboard/reject-detail?date=${today}`,
        );
        if (rejectRes.ok) {
          const rejectJson = await rejectRes.json();
          rejectDetailData = rejectJson.data || null;
        }
      } catch (_) {
        // endpoint belum ada — biarkan null, RightColumn akan pakai default
      }

      const activeShift = getActiveShift();
      const now = new Date();

      // Cari row aktif hari ini
      let activeRow =
        rows.find(
          (r) => r.shift === activeShift && toWIBDateStr(r.tanggal) === today,
        ) || null;

      // Shift 2 lewat tengah malam → cari kemarin
      if (activeShift === "Shift 2" && now.getHours() < 7) {
        const yesterday = new Date(now - 86_400_000);
        const yStr = [
          yesterday.getFullYear(),
          String(yesterday.getMonth() + 1).padStart(2, "0"),
          String(yesterday.getDate()).padStart(2, "0"),
        ].join("-");
        activeRow =
          rows.find(
            (r) => r.shift === "Shift 2" && toWIBDateStr(r.tanggal) === yStr,
          ) || activeRow;
      }

      // ── Field langsung dari DB ──────────────────────────
      const output_plan = Number(activeRow?.output_plan) || 0;
      const output_produksi = Number(activeRow?.output_total) || 0;
      const qty_reject = Number(activeRow?.reject_qty) || 0;
      const stoptime_menit = Number(activeRow?.stoptime_total) || 0;
      const cycle_time_swi =
        activeRow?.cycle_time_swi != null
          ? Number(activeRow.cycle_time_swi)
          : null;
      const cycle_time_actual =
        activeRow?.cycle_time_actual != null
          ? Number(activeRow.cycle_time_actual)
          : null;

      // ── Dihitung lokal ──────────────────────────────────
      const deviasi_target = output_produksi - output_plan;
      const qty_reject_ppm =
        output_produksi > 0
          ? Math.round((qty_reject / output_produksi) * 1_000_000)
          : 0;

      // ── Personnel ───────────────────────────────────────
      const parsedKetua = parsePersonnelField(activeRow?.cell_leader_nama);
      const parsedTeknisi = parsePersonnelField(activeRow?.pj_teknis_nama);
      const parsedInspector = parsePersonnelField(activeRow?.inspector_nama);
      const inspectorNik = parsedInspector.nik || null;
      const inspectorFoto = buildFotoUrl(inspectorNik);

      // ── Hourly dari trend endpoint ──────────────────────
      const trendRows =
        activeShift === "Shift 2"
          ? trendJson.shift2 || []
          : trendJson.shift1 || [];

      const hourly = trendRows.map((p) => ({
        slot: p.label,
        output_plan: p.output_plan,
        output_actual: p.output_actual,
        deviasi: p.deviasi,
        pencapaian: p.pencapaian,
      }));

      const ketuaNik = parsedKetua.nik || null;
      const teknisiNik = parsedTeknisi.nik || null;
      const ketuaFoto = buildFotoUrl(ketuaNik);
      const teknisiFoto = buildFotoUrl(teknisiNik);

      setState((prev) => ({
        ...prev,
        tanggal: activeRow ? toWIBDateStr(activeRow.tanggal) : today,
        line: activeRow?.line || null,
        cl_no: activeRow?.cl_no || null,
        nama_produk: activeRow?.product_name || null,
        cell_leader_nama: activeRow?.cell_leader_nama || null,
        cycle_time_swi,
        cycle_time_actual,
        output_plan,
        output_produksi,
        deviasi_target,
        qty_reject,
        qty_reject_ppm,
        stoptime_menit,
        hourly,
        trend_s1: trendJson.shift1 || [],
        trend_s2: trendJson.shift2 || [],
        personnel: {
          ketua: {
            nama: parsedKetua.nama || prev.personnel?.ketua?.nama || null,
            no_karyawan: ketuaNik || prev.personnel?.ketua?.no_karyawan || null,
            telp: prev.personnel?.ketua?.telp || null,
            foto: ketuaFoto,
          },
          pj_teknis: {
            nama: parsedTeknisi.nama || prev.personnel?.pj_teknis?.nama || null,
            no_karyawan:
              teknisiNik || prev.personnel?.pj_teknis?.no_karyawan || null,
            telp: prev.personnel?.pj_teknis?.telp || null,
            foto: teknisiFoto,
          },
          inspector: {
            nama: parsedInspector.nama || null,
            no_karyawan: inspectorNik || null,
            telp: null,
            foto: inspectorFoto,
          },
        },
        reject_detail: rejectDetailData,
        preventive_maintenance: prev.preventive_maintenance,
        lastRefresh: new Date(),
        loading: false,
        error: null,
        monthly: {
          total_qty_reject: monthlyJson.total_qty_reject,
          ppm: monthlyJson.ppm,
          micro_stop: null,
          proses_bermasalah: [],
        },
      }));
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  return state;
}
