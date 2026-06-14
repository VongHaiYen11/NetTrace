# NOC Alarms Analytics API

A high-performance Express.js backend API implemented in TypeScript, combining **ClickHouse** (analytical logs) and **PostgreSQL** (relational configuration metadata) to deliver sub-second analytics, aggregations, and data federation for NOC alarms.

---

## 📌 Architecture Design

The project uses a standard layered architecture:

```text
Request ➔ Route ➔ Controller ➔ Service ➔ Repository ➔ Database
```

* **Route Layer**: Matches incoming endpoints, sets up Swagger documentation, and validates queries using Zod validation.
* **Controller Layer**: Handles incoming HTTP requests, extracts validated parameters, delegates execution to the service layer, and shapes JSON outputs.
* **Service Layer**: Manages business logic, calculates operational durations, aggregates data in memory, and performs **Data Federation**.
* **Repository Layer**: Generates optimized ClickHouse queries and parameter-bound PostgreSQL queries.
* **Database Connection Layer**: Manages PostgreSQL connection pools and the ClickHouse singleton client instance.

---

## 🔗 Data Federation Mechanism

To ensure maximum performance and separation of concerns, the PostgreSQL and ClickHouse databases are **never joined directly**. Instead, federation is managed at the Node.js application level:

1. **Query clickhouse**: Fetch a page of alarm records from ClickHouse using optimized filters and indices.
2. **Extract IDs**: In the Service layer, scan the result set to extract distinct, unique `device_id`s and `error_code`s.
3. **Query Postgres in parallel**: Dispatch parameterized Postgres queries concurrently using `Promise.all` to retrieve device details (joined with vendor and station) and error metadata.
4. **Stitch in memory**: Map the retrieved PostgreSQL objects using dictionary lookups and stitch them into the final JSON response.

---

## ⚡ ClickHouse Optimization Rules

* **PREWHERE Clauses**: When filtering by timestamp ranges, queries use `PREWHERE time_created BETWEEN ...` which instructs ClickHouse to evaluate the range condition first before loading the other columns from disk.
* **LowCardinality Indexing**: Low-cardinality columns (`severity` and `status`) are positioned first in `WHERE` and `GROUP BY` statements to take advantage of dictionary indexing.
* **Avoiding SELECT \***: Queries explicitly request only required fields to minimize RAM and disk read bandwidth.
* **Keyset Cursor Pagination**: The detail list endpoint utilizes cursor variables (`cursor_time`, `cursor_id`) to execute timeline queries (`(time_created, alarm_id) < (cursor_time, cursor_id)`), avoiding the heavy query scanning of `OFFSET`.

---

## 🧭 Implemented Endpoints

All endpoints are registered under the `/api/v1` namespace:

### 1. Detail Queries (`GET /api/v1/alarms`)
* Retrieves list of alarms with filtering on `severity`, `status`, `device_id`, and `error_code`.
* Uses keyset pagination via query params `cursor_time` and `cursor_id`.
* Enriches each alarm row with PostgreSQL device metadata (name, station details, vendor name) and error name/domain.

### 2. Time Series Count (`GET /api/v1/analytics/time-series/count`)
* Groups counts of total and active alarms over hourly (`interval=hour`) or daily (`interval=day`) buckets.
* Employs native ClickHouse functions `toStartOfHour()` and `toStartOfDay()`.

### 3. Operational Duration Series (`GET /api/v1/analytics/time-series/duration`)
* Calculates operational resolution duration by bucket (`interval` can be day, month, or year).
* Uses ClickHouse formula `avg(if(isNull(time_solved), now(), time_solved) - time_created)` to compute seconds elapsed.

### 4. Top-N ranking (`GET /api/v1/analytics/top-n`)
* Ranks top elements by volume. Param `by` supports `device` (top devices) or `error_code` (top error codes).
* Enriches the response with labels (e.g. `Device Name (Station Name)`) using Postgres records.

### 5. Ratio breakdown (`GET /api/v1/analytics/ratio`)
* Returns count and percentage share composition. Param `by` supports:
  * `severity` (Direct ClickHouse LowCardinality aggregation).
  * `type` (Groups counts in memory by resolved PostgreSQL `device_type`).
  * `station` (Groups counts in memory by resolved PostgreSQL station `name`).
  * `site` (Groups counts in memory by resolved PostgreSQL `station_id`).
  * `region` (Groups counts in memory by resolved PostgreSQL station `province`).

---

## 🛠 Tech Stack & Libraries

* **Core**: Node.js (ES2022+ ESM) & TypeScript
* **Router Framework**: Express.js
* **ClickHouse Driver**: `@clickhouse/client` (Official HTTP client singleton setup)
* **PostgreSQL Driver**: `pg` (Database connection pool, max 20, query timeout 5s)
* **Validation**: `zod`
* **Logging**: `pino` (Structured JSON outputs, P95 SLA warnings)
* **Documentation**: `swagger-ui-express` & `swagger-jsdoc` (OpenAPI Swagger UI mounted at `/api-docs`)
* **Testing**: `jest` & `ts-jest`

---

## 🚀 Setting Up & Running

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in your connection details:
```env
PORT=3000
NODE_ENV=development

PG_HOST=your-postgres-host
PG_PORT=5432
PG_USER=your-postgres-user
PG_PASSWORD=your-postgres-password
PG_DATABASE=your-postgres-db

CLICKHOUSE_HOST=http://your-clickhouse-host:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default
```

### 2. Verify Database Connection
Run the health check utility script to inspect database connections, tables, row counts, and columns:
```bash
npm run db:check
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Build (TypeScript Compilation)
```bash
npm run build
```

### 5. Run Unit Tests
```bash
npm run test
```

### 6. Code Style & Lint Checks
```bash
npm run lint
```
