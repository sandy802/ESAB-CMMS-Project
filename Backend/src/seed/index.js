const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const seed = async () => {
  console.log("Seeding users...");

  const users = [
    { name: "Admin User",        username: "admin",       password: "admin123",    role: "admin" },
    { name: "Maintenance Staff", username: "maintenance", password: "maint123",    role: "maintenance" },
    { name: "Operator User",     username: "operator",    password: "operator123", role: "operator" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);

    await pool.query(
      `INSERT INTO users (name, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.name, u.username, hash, u.role]
    );

    console.log(`  ✓ ${u.role} — username: ${u.username}  password: ${u.password}`);
  }

  console.log("Seeding done.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});