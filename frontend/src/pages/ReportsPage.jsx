// pages/ReportsPage.jsx
import { useState } from "react";
import { PageHeader } from "../components/ui";
import { CalendarDays, ChevronDown } from "lucide-react";
import useFetch from "../hooks/useFetch";
import api from "../services/auth.api";

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const BulbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </svg>
);

const KPI_STYLES = [
  { key: "totalTickets", label: "Total Tickets", color: "#f59e0b", icon: <AlertIcon /> },
  { key: "openTickets", label: "Open Tickets", color: "#ef4444", icon: <ClipboardIcon /> },
  { key: "inProgressTickets", label: "In Progress", color: "#3b82f6", icon: <RefreshIcon /> },
  { key: "closedTickets", label: "Closed Tickets", color: "#22c55e", icon: <CheckIcon /> },
  { key: "avgMTTRMinutes", label: "Avg MTTR (min)", color: "#a855f7", icon: <ClockIcon /> },
  { key: "avgMTBFMinutes", label: "Avg MTBF (min)", color: "#14b8a6", icon: <TrendIcon /> },
];

const ReportsPage = () => {
  const [exporting, setExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");

  const { data: assets } = useFetch("/assets");

  const queryParams = new URLSearchParams();
  if (selectedDate) queryParams.set("from", selectedDate);
  if (selectedMachine) queryParams.set("assetId", selectedMachine);
  const queryString = queryParams.toString();

  const { data, loading, error } = useFetch(
    `/reports/summary${queryString ? `?${queryString}` : ""}`
  );

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.get(
        `/reports/export/csv${queryString ? `?${queryString}` : ""}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reports.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Loading report data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Failed to load reports: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reports" subtitle="Maintenance Analytics & KPIs" />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Filters:</span>

          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 w-44 bg-gray-900 border border-gray-800 pl-9 pr-3 text-xs text-gray-300 outline-none focus:border-gray-600"
            />
          </div>

          <div className="relative">
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="h-8 w-44 appearance-none bg-gray-900 border border-gray-800 px-3 pr-8 text-xs text-gray-300 outline-none focus:border-gray-600"
            >
              <option value="">Select Machine</option>
              {(assets || []).map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-sm text-teal-400 border border-gray-700 disabled:opacity-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_STYLES.map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-lg bg-gray-900 p-4"
            style={{ borderLeft: `3px solid ${kpi.color}` }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: kpi.color }}>
              {kpi.icon}
              <span className="text-xs text-gray-400">{kpi.label}</span>
            </div>
            <div className="text-2xl font-medium text-white">
              {data?.[kpi.key] ?? "-"}
            </div>
          </div>
        ))}
      </div>

      {data?.charts && Object.keys(data.charts).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.values(data.charts).map((chart, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-700 bg-gray-900 p-4 flex flex-col gap-3"
            >
              <img
                src={chart.image}
                alt="Report chart"
                className="w-full rounded"
              />
              <div className="rounded-md bg-gray-800 p-3 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5"><BulbIcon /></span>
                <p className="text-xs text-gray-300 leading-relaxed">{chart.insight}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReportsPage;