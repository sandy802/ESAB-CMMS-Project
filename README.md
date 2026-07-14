# ESAB CMMS - Full-Stack Maintenance Control System

A centralized breakdown tracking and machine health monitoring system, built as a full-stack recreation of a real-world CMMS.

## Tech Stack
- Frontend: React 19, Redux Toolkit, Tailwind CSS, Axios
- Backend: Node.js, Express, raw SQL via pg (no ORM)
- Database: PostgreSQL
- Analytics: Python script (pandas + psycopg2) called as a subprocess for the Reports page

## Features
- JWT auth with refresh tokens, role-based access (admin / maintenance / operator)
- Full ticket lifecycle (create, pickup, close) with real MTTR calculation
- MTBF calculated per-asset and system-wide
- Master data CRUD (machines, locations, breakdown types, root causes, MTTR reasons)
- User management (create / deactivate)
- Live dashboard KPIs
- Reports page powered by a Python/pandas analytics script

## Local Setup

### Database
psql -U postgres -c "CREATE DATABASE cmms_db;"
psql -U postgres -d cmms_db -f Backend/schema.sql

### Backend
cd Backend && npm install && npm run seed && npm run seed:master && npm run seed:tickets && npm run dev

### Frontend
cd frontend && npm install && npm run dev

### Python analytics
cd analytics && python -m venv venv && venv\Scripts\activate && pip install pandas psycopg2-binary

## Test Credentials
admin / admin123 (admin role)
maintenance / maint123 (maintenance role)
operator / operator123 (operator role)

## Known Limitations
- Dashboard charts are placeholders (KPI numbers are live, charts not built yet)
- Dashboard filters are UI-only, not wired to backend yet

## Author
Sandesh Ghule
