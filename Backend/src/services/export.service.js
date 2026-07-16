const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://127.0.0.1:5001";

const exportCsv = async ({ from, to, assetId } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (assetId) params.set("assetId", assetId);

  const url = `${ANALYTICS_URL}/export/csv${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Analytics service returned ${response.status}`);

  return response.text();
};

module.exports = { exportCsv };
