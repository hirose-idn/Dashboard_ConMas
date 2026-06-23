import React from "react";
import { C } from "../../config/constants";
import { DataBadge, Avatar, SectionTitle, KVRow } from "../ui";

// ─── Placeholder QR Code ──────────────────────────────────
function QRPlaceholder() {
  return (
    <div
      style={{
        width: 76,
        height: 76,
        margin: "0 auto",
        background: "linear-gradient(135deg, #003a52, #050f14)",
        border: `1px solid ${C.borderBr}`,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* scan line animasi */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.blue}88, transparent)`,
          animation: "scan 2s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, marginBottom: 2 }}>▦</div>
        <div style={{ fontSize: 7, color: C.textDim }}>QR Code</div>
      </div>
    </div>
  );
}

// ─── Parse "NIK,Nama" dari field DB ──────────────────────
function parseNamaField(raw) {
  if (!raw) return { nik: null, nama: null };
  const parts = String(raw).split(",");
  if (parts.length >= 2) {
    return { nik: parts[0].trim(), nama: parts.slice(1).join(",").trim() };
  }
  // Kalau tidak ada koma, cek apakah angka (NIK) atau nama
  return /^\d+$/.test(raw.trim())
    ? { nik: raw.trim(), nama: null }
    : { nik: null, nama: raw.trim() };
}

// ─── Card info personel (ketua / PJ teknis) ──────────────
function PersonelCard({ icon, title, data, live }) {
  // Nama & NIK sudah di-parse di hook — tinggal pakai langsung
  // Fallback: kalau nama masih mengandung koma (mock/belum di-parse), parse di sini
  const parsed = parseNamaField(data?.nama);
  const hasComma = data?.nama && String(data.nama).includes(",");
  const nama = hasComma ? parsed.nama || null : data?.nama || null;
  const nik = hasComma
    ? parsed.nik || data?.no_karyawan || null
    : data?.no_karyawan || null;
  const telp = data?.telp || null;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <SectionTitle color={C.blue} icon={icon}>
        {title} <DataBadge live={!!live} />
      </SectionTitle>
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Avatar foto={data?.foto} nama={nama} size={60} />
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: "#fff",
            textAlign: "center",
          }}
        >
          {nama || "—"}
        </div>
        {nik && (
          <div style={{ fontSize: 10, color: C.textDim }}>NIK: {nik}</div>
        )}
        {telp && <div style={{ fontSize: 10, color: C.textDim }}>{telp}</div>}
      </div>
    </div>
  );
}

// ─── Kolom kiri dashboard ─────────────────────────────────
export default function LeftColumn({ tanggal, line, nama_produk, personnel, lastRefresh }) {
  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div
      style={{
        borderRight: `1px solid ${C.borderBr}`,
        display: "flex",
        flexDirection: "column",
        background: C.panel,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* ── Info dasar ── */}
      <div
        style={{
          padding: "7px 9px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <KVRow label="Tanggal" value={tanggal || today} valueColor={C.blue} />
        <KVRow label="CL No" value={personnel?.cl_no || "—"} valueColor={C.blue} />
        <KVRow label="Nama Produk" value={nama_produk || "—"} valueColor={C.text} />

        <div
          style={{
            marginTop: 4,
            fontSize: 9,
            color: C.textDim,
            marginBottom: 3,
          }}
        >
          Kode Cetak
        </div>
        <QRPlaceholder />
      </div>

      {/* ── Personel ── */}
      <PersonelCard icon="👤" title="Cell Leader" data={personnel?.ketua} />
      <PersonelCard icon="🔧" title="PJ Teknisi" data={personnel?.pj_teknis} />
      <PersonelCard icon="🔍" title="Inspector" data={personnel?.inspector} />
      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: "4px 8px",
          borderTop: `1px solid ${C.border}`,
          fontSize: 8,
          color: C.textMut,
          textAlign: "center",
        }}
      >
        {lastRefresh?.toLocaleTimeString("id-ID") || "—"}
      </div>
    </div>
  );
}
