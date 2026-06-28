import React, { useState, useEffect, useCallback } from "react";
import PCBDashboard from "./components/dashboard/PCBDashboard";
import LinePicker from "./components/dashboard/LinePicker";

function getLineFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("line");
}

export default function App() {
  const [line, setLine] = useState(getLineFromUrl());

  // Klik kartu line di LinePicker -> update URL (?line=...) TANPA reload,
  // jadi tetap bisa di-bookmark/share per line buat dipasang di tablet.
  const selectLine = useCallback((code) => {
    const url = new URL(window.location.href);
    url.searchParams.set("line", code);
    window.history.pushState({}, "", url);
    setLine(code);
  }, []);

  // Tombol back/forward browser tetap konsisten sama state.
  useEffect(() => {
    const onPopState = () => setLine(getLineFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (!line) {
    return <LinePicker onSelect={selectLine} />;
  }
  return <PCBDashboard line={line} />;
}