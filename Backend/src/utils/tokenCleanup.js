const pool = require("../config/database");

// Runs once on server start, then every 24 hours
// Deletes blacklisted tokens that have already expired — no point keeping them
const startCleanupJob = () => {
  const run = async () => {
    try {
      const result = await pool.query(
        "DELETE FROM blacklisted_tokens WHERE expires_at < NOW()"
      );
      if (result.rowCount > 0) {
        console.log(`Cleanup: removed ${result.rowCount} expired blacklisted token(s)`);
      }
    } catch (err) {
      console.error("Cleanup job error:", err.message);
    }
  };

  run(); // run immediately on start
  setInterval(run, 24 * 60 * 60 * 1000); // then every 24 hours
};

module.exports = { startCleanupJob };