const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://127.0.0.1:5001";

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const getReportsSummary = async ({ from, to, assetId } = {}) => {
  const cacheKey = JSON.stringify({ from: from || null, to: to || null, assetId: assetId || null });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (assetId) params.set("assetId", assetId);

  const url = `${ANALYTICS_URL}/summary${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Analytics service returned ${response.status}`);

  const result = await response.json();
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
};

module.exports = { getReportsSummary };
