const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/database");

const isProd = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // false on localhost, true in prod
  sameSite: isProd ? "none" : "lax", // lax works on localhost HTTP
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = () => {
  // Random 64-byte hex string — not a JWT, just a secure random token
  return crypto.randomBytes(64).toString("hex");
};

// POST /auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last_login_at
    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token in DB with 7 day expiry
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken],
    );

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /auth/refresh
const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const result = await pool.query(
      `SELECT rt.*, u.id as user_id, u.role, u.name, u.username, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [token],
    );

    const row = result.rows[0];

    if (!row) {
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    if (!row.is_active) {
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Account is deactivated" });
    }

    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);

    const newRefreshToken = generateRefreshToken();
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [row.user_id, newRefreshToken],
    );

    const accessToken = generateAccessToken({
      id: row.user_id,
      role: row.role,
    });

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken,
      user: {
        id: row.user_id,
        name: row.name,
        username: row.username,
        role: row.role,
      },
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /auth/logout
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const authHeader = req.headers["authorization"];

  // Blacklist the access token so it's dead immediately
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const accessToken = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const expiresAt = new Date(decoded.exp * 1000); // exp is in seconds

      await pool.query(
        `INSERT INTO blacklisted_tokens (token, expires_at)
         VALUES ($1, $2)
         ON CONFLICT (token) DO NOTHING`,
        [accessToken, expiresAt],
      );
    } catch (err) {
      // Token already expired or invalid — no need to blacklist
    }
  }

  // Delete refresh token from DB
  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out" });
};

// GET /auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, username, role FROM users WHERE id = $1 AND is_active = TRUE",
      [req.user.id],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Get me error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, refresh, logout, getMe };
