const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const reportsController = require("../controllers/reports.controller");

router.get("/summary", authenticate, reportsController.getSummary);

module.exports = router;
