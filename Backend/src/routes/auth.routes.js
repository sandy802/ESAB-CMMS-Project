const express = require("express");
const router = express.Router();
const { login, refresh, logout, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/login",   login);
router.post("/refresh", refresh);
router.post("/logout",  logout);
router.get("/me",       authenticate, getMe);

module.exports = router;