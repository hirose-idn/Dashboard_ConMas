const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const dashboardRoutes = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static — foto personel ─────────────────────────────────
// Akses via: http://localhost:5000/foto/<NIK>.jpg
// Taruh file foto di folder: backend/uploads/foto/
app.use('/foto', express.static(path.join(__dirname, 'uploads', 'foto')));

// ── Foto resolve — cari file by NIK, ekstensi apapun ──────
// GET /foto-resolve/:nik → redirect ke URL file yang ditemukan, atau 404
const fs   = require('fs');
app.get('/foto-resolve/:nik', (req, res) => {
  const fotoDir = path.join(__dirname, 'uploads', 'foto');
  const nik     = req.params.nik;
  const exts    = ['jpeg', 'jpg', 'png', 'webp'];
  for (const ext of exts) {
    const filePath = path.join(fotoDir, `${nik}.${ext}`);
    if (fs.existsSync(filePath)) {
      return res.redirect(`/foto/${nik}.${ext}`);
    }
  }
  return res.status(404).json({ message: 'Foto tidak ditemukan', nik });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend jalan di http://localhost:${PORT}`);
  console.log(`📊 Dashboard API : http://localhost:${PORT}/api/dashboard`);
  console.log(`🖼  Foto personel : http://localhost:${PORT}/foto/<NIK>.jpg`);
});
