// pages/ReportsPage.jsx
import { PageHeader, KPICard } from "../components/ui";
import useFetch from "../hooks/useFetch";

const ReportsPage = () => {
  const { data, loading, error } = useFetch("/reports/summary"); 

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
      <PageHeader title="Reports" subtitle="Maintenance analytics & KPIs" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Total Tickets" value={data?.totalTickets ?? "-"} />
        <KPICard label="Open Tickets" value={data?.openTickets ?? "-"} />
        <KPICard label="In Progress" value={data?.inProgressTickets ?? "-"} />
        <KPICard label="Closed Tickets" value={data?.closedTickets ?? "-"} />
        <KPICard
          label="Avg MTTR (min)"
          value={data?.avgMTTRMinutes ?? "-"}
        />
        <KPICard
          label="Avg MTBF (min)"
          value={data?.avgMTBFMinutes ?? "-"}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
