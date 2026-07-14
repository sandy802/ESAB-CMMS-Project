const reportsService = require("../services/reports.service");

const getSummary = async (req, res) => {
  try {
    const summary = await reportsService.getReportsSummary();
    res.status(200).json(summary);
  } catch (err) {
    console.error("Reports summary error:", err);
    res.status(500).json({ message: err.message || "Failed to generate report" });
  }
};

module.exports = { getSummary };
