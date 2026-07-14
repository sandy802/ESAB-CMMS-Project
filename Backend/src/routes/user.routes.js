const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, deactivateUser } = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All user routes require auth + admin role
router.get("/", authenticate, authorize(["admin"]), getAllUsers);
router.post("/", authenticate, authorize(["admin"]), createUser);
router.patch("/:id/deactivate", authenticate, authorize(["admin"]), deactivateUser);

module.exports = router;