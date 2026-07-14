const pool = require("../config/database");

class CrudService {
  constructor(tableName, uniqueField = "name") {
    this.tableName = tableName;
    this.uniqueField = uniqueField; // field to check for duplicate on create/update
  }

  async getAll({ includeInactive = false } = {}) {
    const where = includeInactive ? "" : "WHERE is_active = TRUE";
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} ${where} ORDER BY name ASC`
    );
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    // Check unique field conflict
    const existing = await pool.query(
      `SELECT id FROM ${this.tableName} WHERE LOWER(${this.uniqueField}) = LOWER($1)`,
      [data[this.uniqueField]]
    );
    if (existing.rows.length > 0) {
      const err = new Error(`${this.uniqueField} already exists`);
      err.status = 400;
      throw err;
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const columns = keys.join(", ");

    const result = await pool.query(
      `INSERT INTO ${this.tableName} (${columns})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async update(id, data) {
    // If updating the unique field, check for conflicts excluding current record
    if (data[this.uniqueField]) {
      const existing = await pool.query(
        `SELECT id FROM ${this.tableName}
         WHERE LOWER(${this.uniqueField}) = LOWER($1) AND id != $2`,
        [data[this.uniqueField], id]
      );
      if (existing.rows.length > 0) {
        const err = new Error(`${this.uniqueField} already exists`);
        err.status = 400;
        throw err;
      }
    }

    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) {
      const err = new Error("No fields to update");
      err.status = 400;
      throw err;
    }

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE ${this.tableName}
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );

    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = CrudService;