const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth",            require("./routes/auth.routes"));
app.use("/api/users",           require("./routes/user.routes"));
app.use("/api/assets",          require("./routes/asset.routes"));
app.use("/api/locations",       require("./routes/location.routes"));
app.use("/api/breakdown-types", require("./routes/breakdownType.routes"));
app.use("/api/root-causes",     require("./routes/rootCause.routes"));
app.use("/api/mttr-reasons",    require("./routes/mttrReason.routes"));
app.use("/api/tickets",       require("./routes/ticket.routes"));
app.use("/api/dashboard",     require("./routes/dashboard.routes"));  // Day 6
app.use("/api/reports", require("./routes/reports.routes"));
// app.use("/api/reports",       require("./routes/report.routes"));     // Day 7

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;