# API Contracts — CMMS Backend

Base URL: `http://localhost:5000/api`

---

## AUTH

### POST /auth/login
```
Body:
{
  username: string,
  password: string
}

Response 200:
{
  token: string,
  user: {
    id: number,
    name: string,
    username: string,
    role: "admin" | "maintenance" | "operator"
  }
}

Response 401:
{ message: "Invalid credentials" }

Response 403:
{ message: "Account is deactivated" }
```

### GET /auth/me
```
Headers: Authorization: Bearer <token>

Response 200:
{
  id: number,
  name: string,
  username: string,
  role: "admin" | "maintenance" | "operator"
}

Response 401:
{ message: "Unauthorized" }
```

---

## USERS

### GET /users
```
Headers: Authorization: Bearer <token>   [admin only]

Response 200:
[
  {
    id: number,
    name: string,
    username: string,
    role: "admin" | "maintenance" | "operator",
    is_active: boolean,
    last_login_at: string | null,   // ISO datetime
    created_at: string
  }
]
```

### POST /users
```
Headers: Authorization: Bearer <token>   [admin only]

Body:
{
  name: string,
  username: string,
  password: string,
  role: "admin" | "maintenance" | "operator"
}

Response 201:
{
  id: number,
  name: string,
  username: string,
  role: string,
  is_active: true,
  created_at: string
}

Response 400:
{ message: "Username already exists" }
```

### PUT /users/:id
```
Headers: Authorization: Bearer <token>   [admin only]

Body (all optional):
{
  name: string,
  role: "admin" | "maintenance" | "operator",
  is_active: boolean
}

Response 200:
{ id, name, username, role, is_active, updated_at }

Response 404:
{ message: "User not found" }
```

### POST /users/:id/reset-password
```
Headers: Authorization: Bearer <token>   [admin only]

Body:
{ new_password: string }

Response 200:
{ message: "Password reset successful" }
```

---

## MASTER DATA
> All master data endpoints follow the same shape.
> Covers: /assets, /locations, /breakdown-types, /root-causes, /mttr-reasons

### GET /{resource}
```
Headers: Authorization: Bearer <token>

Response 200:
[
  {
    id: number,
    name: string,
    description: string | null,
    is_active: boolean,
    created_at: string
  }
]

// assets also includes:
{
  asset_code: string,
  location_id: number | null,
  location_name: string | null
}
```

### POST /{resource}
```
Headers: Authorization: Bearer <token>   [admin only]

Body:
{
  name: string,
  description: string   // optional
  // assets also require: asset_code, location_id
}

Response 201:
{ id, name, description, is_active, created_at }

Response 400:
{ message: "Name already exists" }
```

### PUT /{resource}/:id
```
Headers: Authorization: Bearer <token>   [admin only]

Body (all optional):
{ name, description, is_active }

Response 200:
{ id, name, description, is_active, updated_at }

Response 404:
{ message: "Not found" }
```

### DELETE /{resource}/:id
```
Headers: Authorization: Bearer <token>   [admin only]

Response 200:
{ message: "Deleted successfully" }

Response 400:
{ message: "Cannot delete — linked to existing tickets" }
```

---

## TICKETS

### GET /tickets
```
Headers: Authorization: Bearer <token>

Query params (all optional):
  status=OPEN|IN_PROGRESS|CLOSED
  asset_id=number
  breakdown_type_id=number
  from=YYYY-MM-DD
  to=YYYY-MM-DD
  page=number (default 1)
  limit=number (default 20)

Response 200:
{
  data: [
    {
      id: number,
      ticket_number: string,       // "TKT-0001"
      asset_id: number,
      asset_name: string,
      location_name: string | null,
      breakdown_type: string | null,
      description: string,
      priority: "low" | "medium" | "high",
      status: "OPEN" | "IN_PROGRESS" | "CLOSED",
      reported_by_name: string,
      reported_at: string,
      assigned_to_name: string | null,
      assigned_at: string | null,
      closed_at: string | null,
      mttr_minutes: number | null
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

### GET /tickets/:id
```
Headers: Authorization: Bearer <token>

Response 200:
{
  id, ticket_number, asset_id, asset_name, location_name,
  breakdown_type, description, priority, status,
  reported_by_name, reported_at,
  assigned_to_name, assigned_at,
  closed_by_name, closed_at,
  root_cause: string | null,
  mttr_reason: string | null,
  resolution_notes: string | null,
  parts_replaced: string | null,
  mttr_minutes: number | null
}

Response 404:
{ message: "Ticket not found" }
```

### POST /tickets
```
Headers: Authorization: Bearer <token>   [all roles]

Body:
{
  asset_id: number,
  location_id: number,
  breakdown_type_id: number,
  description: string,
  priority: "low" | "medium" | "high"   // optional, defaults to "medium"
}

Response 201:
{ id, ticket_number, status: "OPEN", reported_at, ...full ticket object }

Response 400:
{ message: "asset_id is required" }
```

### PUT /tickets/:id/assign
```
Headers: Authorization: Bearer <token>   [maintenance, admin]

Body: {}   // assigns to the logged-in user

Response 200:
{ id, ticket_number, status: "IN_PROGRESS", assigned_to_name, assigned_at }

Response 400:
{ message: "Ticket is already assigned or closed" }
```

### PUT /tickets/:id/close
```
Headers: Authorization: Bearer <token>   [maintenance, admin]

Body:
{
  root_cause_id: number,
  mttr_reason_id: number,
  resolution_notes: string,
  parts_replaced: string   // optional
}

Response 200:
{
  id, ticket_number, status: "CLOSED",
  closed_at, mttr_minutes,
  root_cause, mttr_reason, resolution_notes
}

Response 400:
{ message: "Ticket must be IN_PROGRESS before closing" }
```

---

## DASHBOARD

### GET /dashboard/summary
```
Headers: Authorization: Bearer <token>   [admin, maintenance]

Query params (optional):
  from=YYYY-MM-DD
  to=YYYY-MM-DD
  asset_id=number

Response 200:
{
  total_breakdowns: number,
  open_tickets: number,
  in_progress_tickets: number,
  closed_tickets: number,
  avg_mttr_minutes: number,       // average across closed tickets
  avg_mtbf_minutes: number        // average across all assets
}
```

### GET /dashboard/charts
```
Headers: Authorization: Bearer <token>   [admin, maintenance]

Query params: same as summary

Response 200:
{
  breakdown_trend: [
    { date: "YYYY-MM-DD", count: number }
  ],
  by_type: [
    { breakdown_type: string, count: number }
  ],
  by_asset: [
    { asset_name: string, count: number }
  ],
  open_vs_closed: {
    open: number,
    in_progress: number,
    closed: number
  }
}
```

---

## REPORTS

### GET /reports/breakdown-summary
### GET /reports/mttr
### GET /reports/mtbf
### GET /reports/trend
```
Headers: Authorization: Bearer <token>   [admin, maintenance]

Query params:
  from=YYYY-MM-DD
  to=YYYY-MM-DD
  asset_id=number   // optional

Response 200:
{
  filters: { from, to, asset_id },
  data: [ ...rows depending on report type ]
}
```

### GET /reports/:type/export?format=pdf|excel
```
Headers: Authorization: Bearer <token>   [admin only]

Response: file download (PDF or Excel)
```

---

## Common Error Shapes

```
400 Bad Request:      { message: "..." }
401 Unauthorized:     { message: "Unauthorized" }
403 Forbidden:        { message: "Access denied" }
404 Not Found:        { message: "..." }
500 Server Error:     { message: "Internal server error" }
```
