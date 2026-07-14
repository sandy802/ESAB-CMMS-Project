const dashboardService = require("../services/dashboard.service");

// GET /api/dashboard/stats?from=&to=&assetId=
const getStats = async (req, res) => {
  try {
    const { from, to, assetId } = req.query;
    const stats = await dashboardService.getDashboardStats({ from, to, assetId });
    res.status(200).json(stats);
  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("ERROR STACK:", err.stack);
    res.status(err.status || 500).json({ message: err.message || "Failed to load dashboard stats" });
  }
};

module.exports = { getStats };
