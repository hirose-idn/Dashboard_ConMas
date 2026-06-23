import React from "react";
import { C } from "../../config/constants";
import { fmt } from "../../config/utils";
import { DataBadge, ProgressBar, SectionTitle, TH, TD } from "../ui";

// ─── Card waktu siklus ────────────────────────────────────
function CycleTimeCard({ label, value, alert, live = false }) {
  const display = value !== null && value !== undefined ? value : "—";
  return (
    <div
      style={{
        background: alert ? "#2a000822" : "#001a2a22",
        border: `1px solid ${alert ? C.red + "55" : C.green + "33"}`,
        borderRadius: 5,
        padding: "6px 14px",
        textAlign: "center",
        minWidth: 80,
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginBottom: 2,
        }}
      >
        <span style={{ fontSize: 9, color: C.textDim }}>{label}</span>
        <DataBadge live={live} />
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: alert ? C.red : C.green,
          lineHeight: 1,
          textShadow: `0 0 14px ${alert ? C.red : C.green}55`,
        }}
      >
        {display}
      </div>
      <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>sec</div>
    </div>
  );
}

// ─── Card metrik besar (Target/Hasil/Deviasi/PPM) ─────────
function MetricCard({ label, value, color, noBorderRight, badge, unit }) {
  return (
    <div
      style={{
        padding: "14px 10px",
        textAlign: "center",
        minHeight: 120,
        borderRight: noBorderRight ? "none" : `1px solid ${C.border}`,
        background: `radial-gradient(ellipse at 50% 0%, ${color}10, transparent 70%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: C.textDim,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {badge && <DataBadge live={badge === "live"} />}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 900,
            color,
            lineHeight: 1,
            textShadow: `0 0 24px ${color}66`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 10, color: C.textDim }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

// ─── Tabel rekapitulasi per jam ───────────────────────────
function HourlyTable({ hourly }) {
  const rows = [
    { label: "Output Plan", key: "output_plan", color: C.textDim },
    { label: "Output Actual", key: "output_actual", color: C.green },
    { label: "Deviasi", key: "deviasi", color: null },
    { label: "Pencapaian", key: "pencapaian", color: C.blue, suffix: "%" },
  ];

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
      <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
        <tr>
          <TH style={{ width: 110, textAlign: "left" }}>Keterangan</TH>
          {hourly.map((h) => (
            <TH key={h.slot}>{h.slot}</TH>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr
            key={row.key}
            style={{
              background: ri % 2 === 0 ? `${C.border}30` : "transparent",
            }}
          >
            <td
              style={{
                fontSize: 9,
                padding: "4px 6px",
                color: "#8a9ab0",
                borderBottom: `1px solid ${C.border}`,
                borderRight: `1px solid ${C.borderBr}`,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {row.label}
            </td>
            {hourly.map((h) => {
              // Pencapaian = (output_actual / output_plan) * 100
              let v;
              if (row.key === "pencapaian") {
                const plan = Number(h.output_plan);
                const actual = Number(h.output_actual);
                v =
                  plan > 0 && actual !== null && actual !== undefined
                    ? Math.round((actual / plan) * 100)
                    : null;
              } else {
                v = h[row.key];
              }
              const isNeg = row.key === "deviasi" && Number(v) < 0;
              const isPos = row.key === "deviasi" && Number(v) > 0;
              // Pencapaian: hijau >= 100%, kuning >= 80%, merah < 80%
              let clr;
              if (row.key === "pencapaian" && v !== null) {
                clr = v >= 100 ? C.green : v >= 80 ? C.yellow : C.red;
              } else {
                clr = isNeg ? C.red : isPos ? C.green : row.color || C.textDim;
              }
              return (
                <TD
                  key={h.slot}
                  style={{ color: clr, fontSize: 10, padding: "4px 5px" }}
                >
                  {v !== null && v !== undefined
                    ? fmt(v) + (row.suffix || "")
                    : "—"}
                </TD>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Kolom tengah dashboard ───────────────────────────────
export default function CenterColumn({
  nama_produk,
  cycle_time_swi,
  cycle_time_actual,
  output_plan,
  output_produksi,
  deviasi_target,
  qty_reject_ppm,
  stoptime_menit,
  availability,
  monthly,
  hourly,
}) {
  const ctOvertime =
    cycle_time_actual !== null && cycle_time_swi !== null
      ? cycle_time_actual > cycle_time_swi
      : false;

  // qty_reject_ppm sudah dihitung di hook (dari shift berjalan)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: C.panelAlt,
        minHeight: 0,
      }}
    >
      {/* ── Nama produk ── */}
      <div
        style={{
          borderBottom: `1px solid ${C.borderBr}`,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          background: "linear-gradient(90deg, #003a52, #050f14, #003a52)",
        }}
      >
        {/* Siklus — full width */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <CycleTimeCard
            label="Cycle Time SWI"
            value={cycle_time_swi}
            alert={false}
            live={true}
          />
          <CycleTimeCard
            label="Cycle Time Actual"
            value={cycle_time_actual}
            alert={ctOvertime}
            live={true}
          />
        </div>
      </div>

      {/* ── 4 metrik utama ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          borderBottom: `1px solid ${C.borderBr}`,
          flexShrink: 0,
          background: `linear-gradient(180deg, ${C.border}, ${C.panelAlt})`,
        }}
      >
        <MetricCard
          label="Output Plan"
          value={fmt(output_plan)}
          color={C.green}
          badge="live"
          unit="pcs"
        />
        <MetricCard
          label="Output Produksi"
          value={fmt(output_produksi)}
          color={C.text}
          badge="live"
          unit="pcs"
        />
        <MetricCard
          label="Deviasi Target"
          value={(deviasi_target >= 0 ? "+" : "") + fmt(deviasi_target)}
          color={deviasi_target < 0 ? C.red : C.green}
          badge="live"
          unit="pcs"
        />
        <MetricCard
          label="Qty Reject PPM"
          value={fmt(qty_reject_ppm)}
          color={qty_reject_ppm > 0 ? C.red : C.text}
          noBorderRight
          badge="live"
          unit="PPM"
        />
      </div>

      {/* ── Bekidoritsu + OEE + Stoptime ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: `1px solid ${C.borderBr}`,
          flexShrink: 0,
          background: `linear-gradient(180deg, ${C.border}, ${C.panelAlt})`,
        }}
      >
        {/* Bekidoritsu */}
        <div
          style={{
            padding: "14px 16px",
            textAlign: "center",
            minHeight: 110,
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            background: `radial-gradient(ellipse at 50% 0%, ${C.blue}0a, transparent 70%)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
              Bekidoritsu
            </span>
            <DataBadge live={false} />
          </div>
          {availability.operator !== null ? (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span style={{
                fontSize: 38,
                fontWeight: 900,
                color: availability.operator >= 80 ? C.blue : C.red,
                lineHeight: 1,
                textShadow: `0 0 20px ${availability.operator >= 80 ? C.blue : C.red}77`,
                fontVariantNumeric: "tabular-nums",
              }}>
                {fmt(availability.operator, 1)}
              </span>
              <span style={{ fontSize: 10, color: C.textDim }}>%</span>
            </div>
          ) : (
            <div style={{
              height: 38,
              background: `${C.blue}08`,
              border: `1px solid ${C.blue}22`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 9, color: `${C.blue}88`, fontStyle: "italic" }}>— data belum tersedia —</span>
            </div>
          )}
        </div>

        {/* OEE */}
        <div
          style={{
            padding: "14px 16px",
            textAlign: "center",
            minHeight: 110,
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            background: `radial-gradient(ellipse at 50% 0%, ${C.green}07, transparent 70%)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
              OEE
            </span>
            <DataBadge live={false} />
          </div>
          {availability.mesin !== null ? (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span style={{
                fontSize: 38,
                fontWeight: 900,
                color: availability.mesin >= 80 ? C.green : C.red,
                lineHeight: 1,
                textShadow: `0 0 20px ${availability.mesin >= 80 ? C.green : C.red}77`,
                fontVariantNumeric: "tabular-nums",
              }}>
                {fmt(availability.mesin, 1)}
              </span>
              <span style={{ fontSize: 10, color: C.textDim }}>%</span>
            </div>
          ) : (
            <div style={{
              height: 38,
              background: `${C.green}08`,
              border: `1px solid ${C.green}22`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 9, color: `${C.green}88`, fontStyle: "italic" }}>— data belum tersedia —</span>
            </div>
          )}
        </div>

        {/* Stoptime */}
        <div
          style={{
            padding: "14px 16px",
            textAlign: "center",
            minHeight: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            background: `radial-gradient(ellipse at 50% 0%, ${C.orange}0a, transparent 70%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.textDim,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Total Stoptime
            </span>
            <DataBadge live={true} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: C.orange,
                lineHeight: 1,
                textShadow: `0 0 20px ${C.orange}77`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(stoptime_menit, 1)}
            </span>
            <span style={{ fontSize: 10, color: C.textDim }}>menit</span>
          </div>
        </div>
      </div>

      {/* ── Evaluasi Kinerja Line — scope: akumulasi cacat s.d proses bermasalah ── */}
      <div style={{ flexShrink: 0 }}>
        {/* Header center dengan garis dekorasi kiri-kanan */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: `linear-gradient(90deg, transparent, ${C.blue}14, transparent)`,
            borderBottom: `1px solid ${C.border}`,
            padding: "5px 14px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.blue}50)`,
            }}
          />
          <span style={{ fontSize: 10 }}>📊</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.blue,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            Evaluasi Kinerja Line — Bulan Berjalan
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, ${C.blue}50, transparent)`,
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            borderBottom: `1px solid ${C.borderBr}`,
          }}
        >
          {/* Total Qty Reject (akumulasi bulanan) */}
          <div
            style={{
              padding: "10px 8px",
              textAlign: "center",
              minHeight: 120,
              borderRight: `1px solid ${C.border}`,
              background: `radial-gradient(ellipse at 50% 0%, ${C.red}10, transparent 65%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: C.textDim,
                  textAlign: "center",
                  lineHeight: 1.4,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Total Qty Reject (Bulan)
              </span>
              <DataBadge live={false} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.red,
                  lineHeight: 1,
                  textShadow: `0 0 14px ${C.red}55`,
                }}
              >
                {monthly.total_qty_reject !== null
                  ? fmt(monthly.total_qty_reject)
                  : "—"}
              </span>
              <span style={{ fontSize: 10, color: C.textDim }}>pcs</span>
            </div>
          </div>

          {/* Qty Reject PPM akumulasi */}
          <div
            style={{
              padding: "10px 8px",
              textAlign: "center",
              minHeight: 120,
              borderRight: `1px solid ${C.border}`,
              background: `radial-gradient(ellipse at 50% 0%, ${C.red}10, transparent 65%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: C.textDim,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Akumulasi PPM Cacat
              </span>
              <DataBadge live={false} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.red,
                  lineHeight: 1,
                  textShadow: `0 0 14px ${C.red}55`,
                }}
              >
                {monthly.ppm !== null ? fmt(monthly.ppm) : "—"}
              </span>
              <span style={{ fontSize: 10, color: C.textDim }}>PPM</span>
            </div>
          </div>

          {/* 4M Grid — menggantikan Jumlah Micro-Stop & Proses Bermasalah */}
          <div
            style={{
              gridColumn: "span 2",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "auto 1fr 1fr",
            }}
          >
            {/* Label 4M header */}
            <div
              style={{
                gridColumn: "span 2",
                textAlign: "center",
                fontSize: 10,
                fontWeight: 800,
                color: C.blue,
                letterSpacing: "0.10em",
                padding: "3px 0 2px",
                borderBottom: `1px solid ${C.border}`,
                background: `linear-gradient(90deg, transparent, ${C.blue}10, transparent)`,
              }}
            >
              4M
            </div>

            {[
              { label: "MACHINE", key: "machine" },
              { label: "METHOD", key: "method" },
              { label: "MAN", key: "man" },
              { label: "MATERIAL", key: "material" },
            ].map((item, idx) => (
              <div
                key={item.key}
                style={{
                  padding: "8px 10px",
                  textAlign: "center",
                  borderRight: idx % 2 === 0 ? `1px solid ${C.border}` : "none",
                  borderBottom: idx < 2 ? `1px solid ${C.border}` : "none",
                  background: `radial-gradient(ellipse at 50% 0%, ${C.blue}08, transparent 70%)`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: C.textDim,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </span>
                  <DataBadge live={false} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: C.text,
                      lineHeight: 1,
                      textShadow: `0 0 10px ${C.blue}33`,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {monthly[item.key] !== null && monthly[item.key] !== undefined
                      ? fmt(monthly[item.key])
                      : "0"}
                  </span>
                  <span style={{ fontSize: 9, color: C.textDim }}>menit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabel rekapitulasi per jam ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Judul tengah */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px 12px",
            background: `linear-gradient(90deg, transparent, ${C.green}12, transparent)`,
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11 }}>⏱</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.green,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Rekapitulasi Produksi Per Jam
          </span>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          <HourlyTable hourly={hourly} />
        </div>
      </div>
    </div>
  );
}
