const pool = require("../config/database");
const { getMTBFAllAssets } = require("./ticket.service");

// GET /dashboard/stats
const getDashboardStats = async () => {
  const totalResult = await pool.query(`SELECT COUNT(*) AS count FROM tickets`);

  const openResult = await pool.query(
    `SELECT COUNT(*) AS count FROM tickets WHERE status IN ('OPEN', 'IN_PROGRESS')`
  );

  const mttrResult = await pool.query(
    `SELECT AVG(EXTRACT(EPOCH FROM (closed_at - reported_at)) / 60) AS avg_minutes
     FROM tickets
     WHERE status = 'CLOSED' AND closed_at IS NOT NULL`
  );

  const avgMtbfMinutes = await getMTBFAllAssets({});

  return {
    totalBreakdowns: parseInt(totalResult.rows[0].count, 10),
    openTickets: parseInt(openResult.rows[0].count, 10),
    avgMTTRMinutes: mttrResult.rows[0].avg_minutes !== null
      ? Math.round(mttrResult.rows[0].avg_minutes)
      : null,
    avgMTBFMinutes: avgMtbfMinutes,
  };
};

module.exports = { getDashboardStats };
