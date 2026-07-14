const CrudService = require("./crud.service");
const pool = require("../config/database");

class AssetService extends CrudService {
  constructor() {
    super("assets", "name");
  }

  // Override getAll to join location name
  async getAll({ includeInactive = false } = {}) {
    const where = includeInactive ? "" : "WHERE a.is_active = TRUE";
    const result = await pool.query(
      `SELECT
         a.id, a.name, a.asset_code, a.description, a.is_active,
         a.location_id, l.name AS location_name,
         a.created_at, a.updated_at
       FROM assets a
       LEFT JOIN locations l ON l.id = a.location_id
       ${where}
       ORDER BY a.name ASC`
    );
    return result.rows;
  }

  // Override getById to join location name
  async getById(id) {
    const result = await pool.query(
      `SELECT
         a.id, a.name, a.asset_code, a.description, a.is_active,
         a.location_id, l.name AS location_name,
         a.created_at, a.updated_at
       FROM assets a
       LEFT JOIN locations l ON l.id = a.location_id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Override create to also check asset_code uniqueness
  async create(data) {
    const { name, asset_code, location_id, description } = data;

    // Check name duplicate
    const nameCheck = await pool.query(
      "SELECT id FROM assets WHERE LOWER(name) = LOWER($1)",
      [name]
    );
    if (nameCheck.rows.length > 0) {
      const err = new Error("name already exists");
      err.status = 400;
      throw err;
    }

    // Check asset_code duplicate
    const codeCheck = await pool.query(
      "SELECT id FROM assets WHERE LOWER(asset_code) = LOWER($1)",
      [asset_code]
    );
    if (codeCheck.rows.length > 0) {
      const err = new Error("asset_code already exists");
      err.status = 400;
      throw err;
    }

    const result = await pool.query(
      `INSERT INTO assets (name, asset_code, location_id, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, asset_code, location_id || null, description || null]
    );
    return result.rows[0];
  }
}

module.exports = new AssetService();