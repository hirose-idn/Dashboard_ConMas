// Dev (npm start, NODE_ENV=development) → default ke backend lokal port 5000.
// Production (npm run build, NODE_ENV=production) → default relative path ("")
// karena frontend & backend di-serve dari origin yang sama (1 server, 1 port).
export const BASE_URL =
  process.env.REACT_APP_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");
export const REFRESH_MS = 5_000;
export const FOTO_BASE_URL = `${BASE_URL}/foto`;

// ─────────────────────────────────────────────
//  Design tokens — Dark Cyan Theme
// ─────────────────────────────────────────────
export const C = {
  bg: "#050f14",
  panel: "#091820",
  panelAlt: "#07141c",
  border: "#0d3a4f",
  borderBr: "#1a6680",
  green: "#00e5a0",
  greenDim: "#00e5a025",
  blue: "#00cfff",
  blueDim: "#00cfff18",
  orange: "#ffaa00",
  red: "#ff3a5c",
  redDim: "#ff3a5c28",
  yellow: "#ffe066",
  purple: "#a78bfa",
  text: "#d0eef8",
  textDim: "#4a8fa8",
  textMut: "#1e4a5c",
};

// ─────────────────────────────────────────────
//  Global CSS
// ─────────────────────────────────────────────
export const GLOBAL_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #050f14; }
  ::-webkit-scrollbar-thumb { background: #1a6680; border-radius: 2px; }
  @keyframes pulse-dot { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  @keyframes scan { 0%{transform:translateY(-100%);} 100%{transform:translateY(500%);} }
  @keyframes blink-warning { 0%,100%{opacity:1;} 50%{opacity:0.45;} }
`;

// ─────────────────────────────────────────────
//  Mock data
// ─────────────────────────────────────────────
export const MOCK_DATA = {
  personnel: {
    pj_teknis: { nama: null, no_karyawan: null, telp: null, foto: null },
  },

  monthly: {
    total_qty_reject: null,
    ppm: null,
    micro_stop: null,
    proses_bermasalah: [],
  },

  availability: {
    operator: 88, // Bekidoritsu — mock, belum ada row mapping dari ConMas
    mesin: 82, // OEE — mock, belum ada row mapping dari ConMas
  },

  // Preventive Maintenance — mock, isi dari DB kalau sudah ada
  preventive_maintenance: {
    weekly: { last: "08 JUN", next: "15 JUN" },
    monthly: { last: "01 JUN", next: "01 JUL" },
  },

  reject_detail: null,
};