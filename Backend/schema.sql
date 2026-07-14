-- CMMS Database Schema
-- Run this file once to set up the database
-- psql -U postgres -d cmms_db -f schema.sql

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'maintenance', 'operator');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');


-- ─────────────────────────────────────────────
-- MASTER DATA TABLES
-- ─────────────────────────────────────────────

CREATE TABLE locations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  asset_code   VARCHAR(50) NOT NULL UNIQUE,  -- e.g. ESAB-WM-001
  location_id  INT REFERENCES locations(id) ON DELETE SET NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE breakdown_types (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,  -- e.g. Electrical, Mechanical
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE root_causes (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,  -- e.g. Bearing Failure, Overheating
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE mttr_reasons (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,  -- e.g. Spare Part Delay, Technician Unavailable
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           user_role NOT NULL DEFAULT 'operator',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TICKETS
-- ─────────────────────────────────────────────

CREATE TABLE tickets (
  id                SERIAL PRIMARY KEY,
  ticket_number     VARCHAR(20) NOT NULL UNIQUE,  -- e.g. TKT-0001
  asset_id          INT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  location_id       INT REFERENCES locations(id) ON DELETE SET NULL,
  breakdown_type_id INT REFERENCES breakdown_types(id) ON DELETE SET NULL,
  description       TEXT NOT NULL,
  priority          ticket_priority NOT NULL DEFAULT 'medium',
  status            ticket_status NOT NULL DEFAULT 'OPEN',

  -- reporter
  reported_by       INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_at       TIMESTAMP NOT NULL DEFAULT NOW(),

  -- technician who picked it up
  assigned_to       INT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at       TIMESTAMP,

  -- closing details
  closed_by         INT REFERENCES users(id) ON DELETE SET NULL,
  closed_at         TIMESTAMP,
  root_cause_id     INT REFERENCES root_causes(id) ON DELETE SET NULL,
  mttr_reason_id    INT REFERENCES mttr_reasons(id) ON DELETE SET NULL,
  resolution_notes  TEXT,
  parts_replaced    TEXT,

  -- calculated on close (stored for easy querying)
  mttr_minutes      INT,  -- close_time minus reported_time in minutes

  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE blacklisted_tokens (
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES (for common query patterns)
-- ─────────────────────────────────────────────

CREATE INDEX idx_tickets_status      ON tickets(status);
CREATE INDEX idx_tickets_asset_id    ON tickets(asset_id);
CREATE INDEX idx_tickets_reported_at ON tickets(reported_at);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_blacklisted_tokens_expires ON blacklisted_tokens(expires_at);