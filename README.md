# Dashboard ConMas

Dashboard monitoring produksi real-time. Data diambil dari PostgreSQL via Express backend, ditampilkan di React frontend.

---

## Struktur Project

```
Dashboard ConMas/
├── Backendd/
│   ├── .env                  ← credentials DB (tidak di-push ke git)
│   ├── db.js                 ← koneksi PostgreSQL
│   ├── index.js              ← Express server
│   ├── routes/
│   │   └── dashboard.js      ← semua endpoint API
│   └── package.json
│
└── Frontendd/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx                         ← entry point
        ├── index.js
        ├── config/
        │   ├── constants.js                ← BASE_URL, TARGET, warna, mock data
        │   └── utils.js                    ← fmt(), toWIBDateStr(), getTodayWIB(), getActiveShift()
        ├── hooks/
        │   └── useDashboardData.js         ← fetch + state management
        └── components/
            ├── ui/
            │   └── index.jsx               ← komponen primitif (DataBadge, ProgressBar, Avatar, dll.)
            └── dashboard/
                ├── PCBDashboard.jsx        ← orchestrator utama
                ├── DashboardHeader.jsx     ← header + jam + status
                ├── LeftColumn.jsx          ← info line, QR, personel
                ├── CenterColumn.jsx        ← metrik, availability, evaluasi, tabel per jam
                └── RightColumn.jsx         ← jadwal, kualitas, microstop, penghentian line
```

---

## Setup

### Backend

```bash
cd Backendd
npm install
# Pastikan .env sudah diisi (lihat .env.example)
npm start        # production
npm run dev      # development (nodemon)
```

### Frontend

```bash
cd Frontendd
npm install
npm start        # dev server (proxy ke localhost:5000)
npm run build    # production build
```

---

## API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/dashboard` | Semua data harian per shift |
| GET | `/api/dashboard/summary` | Rekap total per shift |
| GET | `/api/dashboard/trend?date=YYYY-MM-DD` | Tren output per-periode |
| GET | `/api/health` | Health check server |

---

## Status Data

| Field | Sumber | File |
|-------|--------|------|
| Tanggal, Line, Nama Produk | ✅ Live DB | `useDashboardData.js` |
| Hasil, Reject, Deviasi, PPM | ✅ Live DB | `useDashboardData.js` |
| Stoptime (man/machine/material/other) | ✅ Live DB | `useDashboardData.js` |
| Waktu siklus standar/aktual | 🟡 Mock | `config/constants.js` → `MOCK_DATA` |
| Availability operator/mesin | 🟡 Mock | `config/constants.js` → `MOCK_DATA` |
| Tabel per jam (hourly) | 🟡 Mock | `config/constants.js` → `MOCK_DATA` |
| Personel (ketua/PJ teknis) | 🟡 Mock | `config/constants.js` → `MOCK_DATA` |
| Detail kualitas, micro-stop, stopline | 🟡 Mock | `config/constants.js` → `MOCK_DATA` |

Untuk mengganti mock → live: tambahkan endpoint di backend, fetch di `useDashboardData.js`, hapus field terkait dari `MOCK_DATA`.

---

## Konfigurasi

Edit `src/config/constants.js`:

```js
export const BASE_URL   = 'http://localhost:5000'; // URL backend
export const REFRESH_MS = 30_000;                  // interval auto-refresh
export const TARGET     = 2400;                    // target produksi per shift
```
