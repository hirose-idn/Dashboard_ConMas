import React from "react";
import { C, GLOBAL_STYLE } from "../../config/constants";
import useDashboardData from "../../hooks/useDashboardData";
import DashboardHeader from "./DashboardHeader";
import LeftColumn from "./LeftColumn";
import CenterColumn from "./CenterColumn";
import RightColumn from "./RightColumn";

export default function PCBDashboard() {
  const d = useDashboardData();

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div
        style={{
          background: C.bg,
          color: C.text,
          fontFamily: "'Segoe UI', 'Meiryo', 'Yu Gothic', sans-serif",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          fontSize: 12,
          overflow: "hidden",
          backgroundImage: `
          linear-gradient(${C.border} 1px, transparent 1px),
          linear-gradient(90deg, ${C.border} 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      >
        <DashboardHeader
          loading={d.loading}
          error={d.error}
          line={d.line}
          nama_produk={d.nama_produk}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 220px",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            alignItems: "stretch",
          }}
        >
          <LeftColumn
            tanggal={d.tanggal}
            line={d.line}
            cl_no={d.cl_no}
            nama_produk={d.nama_produk}
            personnel={d.personnel}
            lastRefresh={d.lastRefresh}
          />

          <CenterColumn
            nama_produk={d.nama_produk}
            cycle_time_swi={d.cycle_time_swi}
            cycle_time_actual={d.cycle_time_actual}
            output_plan={d.output_plan}
            output_produksi={d.output_produksi}
            deviasi_target={d.deviasi_target}
            qty_reject_ppm={d.qty_reject_ppm}
            stoptime_menit={d.stoptime_menit}
            availability={d.availability}
            monthly={d.monthly}
            hourly={d.hourly}
          />

          <RightColumn
            schedule={d.schedule}
            reject_detail={d.reject_detail}
            preventive_maintenance={d.preventive_maintenance}
          />
        </div>
      </div>
    </>
  );
}
