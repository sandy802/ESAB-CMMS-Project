const pool = require("../config/database");

const seed = async () => {
  console.log("Seeding master data...");

  // Locations
  const locations = [
    { name: "Shop Floor A",    description: "Main production floor" },
    { name: "Shop Floor B",    description: "Secondary production floor" },
    { name: "Welding Bay",     description: "Welding operations area" },
    { name: "Assembly Line 1", description: "Primary assembly line" },
    { name: "Maintenance Bay", description: "Maintenance and repair area" },
  ];

  const locationIds = {};
  for (const l of locations) {
    const result = await pool.query(
      `INSERT INTO locations (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name`,
      [l.name, l.description]
    );
    locationIds[l.name] = result.rows[0].id;
    console.log(`  ✓ location: ${l.name}`);
  }

  // Assets (machines)
  const assets = [
    { name: "Welding Machine 1",  asset_code: "ESAB-WM-001", location: "Welding Bay" },
    { name: "Welding Machine 2",  asset_code: "ESAB-WM-002", location: "Welding Bay" },
    { name: "CNC Machine 1",      asset_code: "ESAB-CNC-001", location: "Shop Floor A" },
    { name: "CNC Machine 2",      asset_code: "ESAB-CNC-002", location: "Shop Floor B" },
    { name: "Assembly Robot 1",   asset_code: "ESAB-AR-001",  location: "Assembly Line 1" },
    { name: "Conveyor Belt A",    asset_code: "ESAB-CB-001",  location: "Shop Floor A" },
    { name: "Hydraulic Press 1",  asset_code: "ESAB-HP-001",  location: "Shop Floor B" },
  ];

  for (const a of assets) {
    await pool.query(
      `INSERT INTO assets (name, asset_code, location_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (asset_code) DO NOTHING`,
      [a.name, a.asset_code, locationIds[a.location]]
    );
    console.log(`  ✓ asset: ${a.name} (${a.asset_code})`);
  }

  // Breakdown Types
  const breakdownTypes = [
    "Electrical Failure",
    "Mechanical Failure",
    "Hydraulic Failure",
    "Software / PLC Error",
    "Wear and Tear",
    "Overheating",
    "Operator Error",
    "Material Jam",
  ];

  for (const name of breakdownTypes) {
    await pool.query(
      `INSERT INTO breakdown_types (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
    console.log(`  ✓ breakdown type: ${name}`);
  }

  // Root Causes
  const rootCauses = [
    "Bearing Failure",
    "Motor Burnout",
    "Loose Wiring",
    "Coolant Leak",
    "Belt Snapped",
    "Sensor Malfunction",
    "PLC Fault",
    "Lubrication Failure",
    "Overload",
    "Foreign Object",
  ];

  for (const name of rootCauses) {
    await pool.query(
      `INSERT INTO root_causes (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
    console.log(`  ✓ root cause: ${name}`);
  }

  // MTTR Reasons
  const mttrReasons = [
    "Spare Part Unavailable",
    "Spare Part Delay",
    "Technician Unavailable",
    "Waiting for Approval",
    "Diagnosis Time",
    "Third Party Vendor Required",
    "Shift Changeover",
  ];

  for (const name of mttrReasons) {
    await pool.query(
      `INSERT INTO mttr_reasons (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
    console.log(`  ✓ mttr reason: ${name}`);
  }

  console.log("\nMaster data seeding done.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});