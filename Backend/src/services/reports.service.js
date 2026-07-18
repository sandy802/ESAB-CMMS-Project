const pool = require("../config/database");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const chartCanvas = new ChartJSNodeCanvas({
  width: 600,
  height: 400,
  backgroundColour: "#111827",
});

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function buildFilterClause(from, to, assetId) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (from) {
    conditions.push(`t.reported_at >= $${idx}::timestamp`);
    values.push(from);
    idx++;
  }
  if (to) {
    conditions.push(`t.reported_at <= $${idx}::timestamp`);
    values.push(`${to} 23:59:59`);
    idx++;
  }
  if (assetId) {
    conditions.push(`t.asset_id = $${idx}`);
    values.push(assetId);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
}

async function getTickets(from, to, assetId) {
  const { where, values } = buildFilterClause(from, to, assetId);
  const query = `SELECT t.* FROM tickets t ${where}`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getTicketsWithLabels(from, to, assetId) {
  const { where, values } = buildFilterClause(from, to, assetId);
  const query = `
    SELECT t.*, a.name AS asset_name, bt.name AS breakdown_type_name
    FROM tickets t
    LEFT JOIN assets a ON t.asset_id = a.id
    LEFT JOIN breakdown_types bt ON t.breakdown_type_id = bt.id
    ${where}
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

function calculateMTBFMinutes(tickets) {
  const byAsset = {};
  for (const t of tickets) {
    if (!t.asset_id) continue;
    if (!byAsset[t.asset_id]) byAsset[t.asset_id] = [];
    byAsset[t.asset_id].push(new Date(t.reported_at));
  }

  const gaps = [];
  for (const assetId in byAsset) {
    const times = byAsset[assetId].sort((a, b) => a - b);
    for (let i = 1; i < times.length; i++) {
      gaps.push((times[i] - times[i - 1]) / 60000);
    }
  }

  if (gaps.length === 0) return null;
  const avg = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  return Math.round(avg * 100) / 100;
}

async function getKpiSummary(from, to, assetId) {
  const tickets = await getTickets(from, to, assetId);
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const closed = tickets.filter((t) => t.status === "CLOSED").length;

  const closedWithMttr = tickets.filter(
    (t) => t.status === "CLOSED" && t.mttr_minutes !== null && t.mttr_minutes !== undefined
  );
  const avgMttr =
    closedWithMttr.length > 0
      ? closedWithMttr.reduce((sum, t) => sum + Number(t.mttr_minutes), 0) / closedWithMttr.length
      : null;

  const avgMtbf = calculateMTBFMinutes(tickets);

  return {
    totalTickets: total,
    openTickets: open,
    inProgressTickets: inProgress,
    closedTickets: closed,
    avgMTTRMinutes: avgMttr !== null ? Math.round(avgMttr * 100) / 100 : null,
    avgMTBFMinutes: avgMtbf,
  };
}

async function renderBarChart(labels, data, color, title, yLabel) {
  const configuration = {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: yLabel, data, backgroundColor: color }],
    },
    options: {
      plugins: {
        title: { display: true, text: title, color: "#d1d5db", font: { size: 14 } },
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "#374151" },
          title: { display: true, text: yLabel, color: "#d1d5db" },
        },
      },
    },
  };
  return chartCanvas.renderToDataURL(configuration);
}

async function renderPieChart(labels, data, colors, title) {
  const configuration = {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: {
      plugins: {
        title: { display: true, text: title, color: "#d1d5db", font: { size: 14 } },
        legend: { position: "bottom", labels: { color: "#d1d5db" } },
      },
    },
  };
  return chartCanvas.renderToDataURL(configuration);
}

function countBy(tickets, field, fallback) {
  const counts = {};
  for (const t of tickets) {
    const key = t[field] || fallback;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

async function breakdownByMachine(tickets) {
  const sorted = countBy(tickets, "asset_name", "Unknown");
  const labels = sorted.map(([k]) => k);
  const values = sorted.map(([, v]) => v);
  const image = await renderBarChart(labels, values, "#f59e0b", "Breakdowns by Machine", "Breakdowns");

  const [topMachine, topCount] = sorted[0];
  const insight =
    topCount >= 3
      ? `'${topMachine}' has had ${topCount} breakdowns - the most of any machine. Consider scheduling an inspection or evaluating whether it needs replacement.`
      : "No machine stands out as a repeat failure point yet - breakdowns are fairly spread out.";
  return { image, insight };
}

async function breakdownByType(tickets) {
  const sorted = countBy(tickets, "breakdown_type_name", "Unclassified");
  const labels = sorted.map(([k]) => k);
  const values = sorted.map(([, v]) => v);
  const image = await renderBarChart(labels, values, "#3b82f6", "Breakdowns by Type", "Breakdowns");

  const [topType, topCount] = sorted[0];
  const pct = tickets.length > 0 ? Math.round((topCount / tickets.length) * 1000) / 10 : 0;
  const insight = `'${topType}' is the most common breakdown type, making up ${pct}% of all tickets. Consider preventive maintenance or technician training focused on this area.`;
  return { image, insight };
}

async function openVsClosed(tickets) {
  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const closedCount = tickets.filter((t) => t.status === "CLOSED").length;
  const total = openCount + closedCount;
  const image = await renderPieChart(
    ["Open / In Progress", "Closed"],
    [openCount, closedCount],
    ["#ef4444", "#22c55e"],
    "Open vs Closed Tickets"
  );
  const openPct = total > 0 ? Math.round((openCount / total) * 1000) / 10 : 0;
  const insight =
    openPct >= 50
      ? `${openPct}% of tickets are still open - the maintenance team may be falling behind on resolving breakdowns.`
      : `Only ${openPct}% of tickets are still open - the team is keeping up well with resolving breakdowns.`;
  return { image, insight };
}

async function getCharts(from, to, assetId) {
  const tickets = await getTicketsWithLabels(from, to, assetId);
  if (tickets.length === 0) return {};
  const [machine, type, openClosed] = await Promise.all([
    breakdownByMachine(tickets),
    breakdownByType(tickets),
    openVsClosed(tickets),
  ]);
  return { breakdownByMachine: machine, breakdownByType: type, openVsClosed: openClosed };
}

const getReportsSummary = async ({ from, to, assetId } = {}) => {
  const cacheKey = JSON.stringify({ from: from || null, to: to || null, assetId: assetId || null });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const summary = await getKpiSummary(from, to, assetId);
  summary.charts = await getCharts(from, to, assetId);

  cache.set(cacheKey, { data: summary, timestamp: Date.now() });
  return summary;
};

module.exports = { getReportsSummary };