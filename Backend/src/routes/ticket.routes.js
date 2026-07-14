const express = require("express");
const router = express.Router();
const { createTicket, getTickets, getTicketById, pickupTicket, closeTicket } = require("../controllers/ticket.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All roles can create and view tickets
router.post("/",             authenticate, createTicket);
router.get("/",              authenticate, getTickets);
router.get("/:id",           authenticate, getTicketById);

// Only maintenance and admin can pick up or close tickets
router.patch("/:id/pickup",  authenticate, authorize(["maintenance", "admin"]), pickupTicket);
router.patch("/:id/close",   authenticate, authorize(["maintenance", "admin"]), closeTicket);

module.exports = router;