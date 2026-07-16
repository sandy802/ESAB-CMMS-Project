const pool = require("../config/database");
const { getMTBFAllAssets } = require("./ticket.service");

// GET /dashboard/stats?from=&to=&assetId=
const getDashboardStats = async ({ from, to, assetId } = {}) => {
  let conditions = [];
  const values = [];
  let idx = 1;

  if (from) { conditions.push(`reported_at >= $${idx++}::timestamp`); values.push(new Date(from)); }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(`reported_at <= $${idx++}::timestamp`);
    values.push(toDate);
  }
  if (assetId) { conditions.push(`asset_id = $${idx++}`); values.push(assetId); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS count FROM tickets ${where}`,
    values
  );

  const openConditions = [...conditions, `status IN ('OPEN', 'IN_PROGRESS')`];
  const openWhere = `WHERE ${openConditions.join(" AND ")}`;
  const openResult = await pool.query(
    `SELECT COUNT(*) AS count FROM tickets ${openWhere}`,
    values
  );

  const mttrConditions = [...conditions, `status = 'CLOSED'`, `closed_at IS NOT NULL`];
  const mttrWhere = `WHERE ${mttrConditions.join(" AND ")}`;
  const mttrResult = await pool.query(
    `SELECT AVG(EXTRACT(EPOCH FROM (closed_at - reported_at)) / 60) AS avg_minutes
     FROM tickets
     ${mttrWhere}`,
    values
  );

  const avgMtbfMinutes = await getMTBFAllAssets({ from, to, assetId });

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

