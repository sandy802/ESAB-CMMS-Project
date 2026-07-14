const reportsService = require("../services/reports.service");

const getSummary = async (req, res) => {
  try {
    const { from, to, assetId } = req.query;
    const summary = await reportsService.getReportsSummary({ from, to, assetId });
    res.status(200).json(summary);
  } catch (err) {
    console.error("Reports summary error:", err);
    res.status(500).json({ message: err.message || "Failed to generate report" });
  }
};

module.exports = { getSummary };
