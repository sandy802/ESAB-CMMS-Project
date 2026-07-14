const app = require("./app");
const pool = require("./config/database");
const { startCleanupJob } = require("./utils/tokenCleanup");

const PORT = process.env.PORT || 5000;

pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  }

  startCleanupJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});