const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// -----------------------------------------------------------------
//  Registry line - DISIMPAN DI FILE (data/lines.json), BUKAN DI
//  DATABASE. Sengaja dipisah dari DB ConMas (vendor) supaya:
//    - Gak pernah bikin/ubah objek apa pun di database vendor
//    - Tetap jalan sama persis walau .env diganti nunjuk ke DB mana
//      pun (local dev / server kantor), karena file ini nempel di
//      server backend, gak di database.
//  Nambah line baru = POST ke endpoint ini (atau edit file ini
//  manual), TANPA perlu migrasi/DDL apa pun ke DB vendor.
// -----------------------------------------------------------------

const DATA_FILE = path.join(__dirname, "..", "data", "lines.json");

function readLines() {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === "ENOENT") return []; // file belum ada -> anggap kosong
        throw err;
    }
}

function writeLines(lines) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(lines, null, 2), "utf8");
}

// GET /api/lines - daftar semua line aktif
router.get("/", (req, res) => {
    try {
        const lines = readLines()
            .filter((l) => l.active)
            .sort((a, b) => a.line_code.localeCompare(b.line_code));
        res.json({ success: true, data: lines });
    } catch (err) {
        console.error("GET /lines ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal ambil daftar line", error: err.message });
    }
});

// POST /api/lines - tambah / update line
// body: { line_code: "41HR999", description: "PCB Assy Line 999", shift_scheme: 2 }
router.post("/", (req, res) => {
    try {
        const { line_code, description, shift_scheme } = req.body;

        if (!line_code || typeof line_code !== "string" || !line_code.trim()) {
            return res.status(400).json({ success: false, message: "line_code wajib diisi" });
        }
        const scheme = Number(shift_scheme);
        if (scheme !== 2 && scheme !== 3) {
            return res.status(400).json({ success: false, message: "shift_scheme harus 2 atau 3" });
        }

        const code = line_code.trim();
        const lines = readLines();
        const idx = lines.findIndex((l) => l.line_code === code);
        const entry = {
            line_code: code,
            description: description || null,
            shift_scheme: scheme,
            active: true,
            created_at: idx >= 0 ? lines[idx].created_at : new Date().toISOString(),
        };

        if (idx >= 0) lines[idx] = entry;
        else lines.push(entry);

        writeLines(lines);
        res.status(201).json({ success: true, data: entry });
    } catch (err) {
        console.error("POST /lines ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal tambah line", error: err.message });
    }
});

// DELETE /api/lines/:line_code - nonaktifkan line (soft delete)
router.delete("/:line_code", (req, res) => {
    try {
        const lines = readLines();
        const idx = lines.findIndex((l) => l.line_code === req.params.line_code);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: "Line tidak ditemukan" });
        }
        lines[idx].active = false;
        writeLines(lines);
        res.json({ success: true, message: `Line ${req.params.line_code} dinonaktifkan` });
    } catch (err) {
        console.error("DELETE /lines ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal nonaktifkan line", error: err.message });
    }
});

module.exports = router;