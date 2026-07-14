const pool = require("../config/database");

const seed = async () => {
  console.log("Seeding test tickets...");

  // Fetch IDs from DB — don't hardcode, use what's actually there
  const assets          = await pool.query("SELECT id FROM assets LIMIT 7");
  const locations       = await pool.query("SELECT id FROM locations LIMIT 5");
  const breakdownTypes  = await pool.query("SELECT id FROM breakdown_types LIMIT 8");
  const rootCauses      = await pool.query("SELECT id FROM root_causes LIMIT 5");
  const mttrReasons     = await pool.query("SELECT id FROM mttr_reasons LIMIT 4");
  const users           = await pool.query("SELECT id, role FROM users");

  const assetIds         = assets.rows.map((r) => r.id);
  const locationIds      = locations.rows.map((r) => r.id);
  const breakdownTypeIds = breakdownTypes.rows.map((r) => r.id);
  const rootCauseIds     = rootCauses.rows.map((r) => r.id);
  const mttrReasonIds    = mttrReasons.rows.map((r) => r.id);

  const operator    = users.rows.find((u) => u.role === "operator");
  const maintenance = users.rows.find((u) => u.role === "maintenance");
  const admin       = users.rows.find((u) => u.role === "admin");

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const descriptions = [
    "Machine stopped suddenly during operation",
    "Unusual noise coming from the motor",
    "Hydraulic fluid leaking from the base",
    "Control panel showing error code E-04",
    "Belt snapped mid-production",
    "Temperature alarm triggered repeatedly",
    "Conveyor belt misaligned",
    "Machine vibrating excessively",
    "PLC not responding to input",
    "Safety sensor triggered and locked machine",
  ];

  let count = 0;

  for (let i = 1; i <= 20; i++) {
    const ticketNumber = `TKT-${String(i).padStart(4, "0")}`;

    // Spread reported_at over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const reportedAt = new Date();
    reportedAt.setDate(reportedAt.getDate() - daysAgo);
    reportedAt.setHours(Math.floor(Math.random() * 10) + 7); // between 7am–5pm

    const priority = pick(["low", "medium", "high"]);

    // 8 closed, 4 in_progress, 8 open — gives good dashboard variety
    let status = "OPEN";
    if (i <= 8)       status = "CLOSED";
    else if (i <= 12) status = "IN_PROGRESS";

    let assignedTo   = null;
    let assignedAt   = null;
    let closedBy     = null;
    let closedAt     = null;
    let rootCauseId  = null;
    let mttrReasonId = null;
    let mttrMinutes  = null;
    let resolutionNotes = null;

    if (status === "IN_PROGRESS" || status === "CLOSED") {
      assignedTo = maintenance.id;
      assignedAt = new Date(reportedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000); // up to 2hrs after report
    }

    if (status === "CLOSED") {
      mttrMinutes = Math.floor(Math.random() * 300) + 30; // 30–330 minutes
      closedBy = pick([maintenance.id, admin.id]);
      closedAt = new Date(assignedAt.getTime() + mttrMinutes * 60 * 1000);
      rootCauseId  = pick(rootCauseIds);
      mttrReasonId = pick(mttrReasonIds);
      resolutionNotes = "Issue identified and resolved. Machine tested before restart.";
    }

    await pool.query(
      `INSERT INTO tickets (
         ticket_number, asset_id, location_id, breakdown_type_id,
         description, priority, status,
         reported_by, reported_at,
         assigned_to, assigned_at,
         closed_by, closed_at,
         root_cause_id, mttr_reason_id,
         resolution_notes, mttr_minutes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (ticket_number) DO NOTHING`,
      [
        ticketNumber,
        pick(assetIds),
        pick(locationIds),
        pick(breakdownTypeIds),
        pick(descriptions),
        priority,
        status,
        operator.id,
        reportedAt,
        assignedTo,
        assignedAt,
        closedBy,
        closedAt,
        rootCauseId,
        mttrReasonId,
        resolutionNotes,
        mttrMinutes,
      ]
    );

    count++;
    console.log(`  ✓ ${ticketNumber} — ${status}`);
  }

  console.log(`\nSeeded ${count} tickets.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Ticket seed failed:", err.message);
  process.exit(1);
});