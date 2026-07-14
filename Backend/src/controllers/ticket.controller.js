const ticketService = require("../services/ticket.service");

// POST /tickets
const createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket({
      ...req.body,
      reported_by: req.user.id,
    });
    return res.status(201).json(ticket);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("createTicket error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /tickets
const getTickets = async (req, res) => {
  try {
    const { status, asset_id, breakdown_type_id, from, to, page, limit } = req.query;
    const result = await ticketService.getTickets({
      status, asset_id, breakdown_type_id, from, to, page, limit,
      user_id: req.user.id,
      role: req.user.role,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("getTickets error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.status(200).json(ticket);
  } catch (err) {
    console.error("getTicketById error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /tickets/:id/pickup
const pickupTicket = async (req, res) => {
  try {
    const ticket = await ticketService.pickupTicket(req.params.id, req.user.id);
    return res.status(200).json(ticket);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("pickupTicket error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /tickets/:id/close
const closeTicket = async (req, res) => {
  try {
    const ticket = await ticketService.closeTicket(
      req.params.id,
      req.user.id,
      req.body
    );
    return res.status(200).json(ticket);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("closeTicket error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createTicket, getTickets, getTicketById, pickupTicket, closeTicket };
