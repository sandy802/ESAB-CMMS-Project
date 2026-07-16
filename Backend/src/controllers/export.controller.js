const exportService = require("../services/export.service");

const downloadCsv = async (req, res) => {
  try {
    const { from, to, assetId } = req.query;
    const csvData = await exportService.exportCsv({ from, to, assetId });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
    res.status(200).send(csvData);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

module.exports = { downloadCsv };
