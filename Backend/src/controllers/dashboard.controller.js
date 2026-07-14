const dashboardService = require("../services/dashboard.service");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(err.status || 500).json({ message: err.message || "Failed to load dashboard stats" });
  }
};

module.exports = { getStats };
