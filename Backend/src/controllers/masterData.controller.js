const pool = require("../config/database");

// Tables that have tickets referencing them — block delete if linked
const TICKET_FOREIGN_KEYS = {
  assets:          "asset_id",
  locations:       "location_id",
  breakdown_types: "breakdown_type_id",
  root_causes:     "root_cause_id",
  mttr_reasons:    "mttr_reason_id",
};

// Returns a set of controller functions bound to a specific service
const createMasterDataController = (service) => {

  const getAll = async (req, res) => {
    try {
      const includeInactive = req.query.include_inactive === "true";
      const data = await service.getAll({ includeInactive });
      return res.status(200).json(data);
    } catch (err) {
      console.error("getAll error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const getById = async (req, res) => {
    try {
      const item = await service.getById(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(item);
    } catch (err) {
      console.error("getById error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const create = async (req, res) => {
    try {
      const item = await service.create(req.body);
      return res.status(201).json(item);
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ message: err.message });
      console.error("create error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const update = async (req, res) => {
    try {
      const item = await service.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(item);
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ message: err.message });
      console.error("update error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const remove = async (req, res) => {
    try {
      const { id } = req.params;

      // Check if this entity is referenced in tickets before deleting
      const fkColumn = TICKET_FOREIGN_KEYS[service.tableName];
      if (fkColumn) {
        const linked = await pool.query(
          `SELECT 1 FROM tickets WHERE ${fkColumn} = $1 LIMIT 1`,
          [id]
        );
        if (linked.rows.length > 0) {
          return res.status(400).json({
            message: "Cannot delete — linked to existing tickets",
          });
        }
      }

      const deleted = await service.delete(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      console.error("delete error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  return { getAll, getById, create, update, remove };
};

module.exports = { createMasterDataController };