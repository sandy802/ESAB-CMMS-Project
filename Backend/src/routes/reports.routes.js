const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const reportsController = require("../controllers/reports.controller");
const exportController = require("../controllers/export.controller");

router.get("/summary", authenticate, reportsController.getSummary);
router.get("/export/csv", authenticate, exportController.downloadCsv);

module.exports = router;