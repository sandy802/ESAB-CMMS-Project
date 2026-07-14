const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/stats", authenticate, dashboardController.getStats);

module.exports = router;
