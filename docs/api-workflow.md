# API Workflows & Data Federation Lifecycle

This document describes the request lifecycle, business workflows, and the data federation model implemented in the NetTrace Alarm Analytics APIs.

---

## 🧭 Request Lifecycle

Every API request follows a standard execution pipeline:

```text
HTTP Request
     ↓
Zod Validation Middleware
     ├─► [Failure] 400 Bad Request
     └─► [Success] Parse & Place in res.locals
     ↓
Controller Layer
     └─► Extract params, call Service layer
     ↓
Service Layer (Federation & Business Logic)
     ├─► Check constraints (e.g. 90-day time cap)
     ├─► Call Repository Layer (ClickHouse and/or PostgreSQL)
     └─► Stitch/Coalesce results
     ↓
Controller Layer
     └─► Format standard success envelope, send response (HTTP 200/201)
```

---

## 🔗 Data Federation Workflow

Direct database-level joins between ClickHouse and PostgreSQL are prohibited. Data federation is performed in-memory at the Service layer:

### Workflow Details
1. **Metadata Resolution:** 
   If federated filters (e.g., `device_type`, `vendor`, `station`, or `province`) are specified, query PostgreSQL first to obtain the matching list of `device_id` values.
2. **Telemetry Retrieval:**
   Query ClickHouse to fetch matching alarm events. If step 1 resolved a list of device IDs, append `device_id IN (:device_ids)` to the ClickHouse SQL query.
3. **Primary ID Collection:**
   Collect all unique `device_id` and `error_code` values from the retrieved ClickHouse alarm rows.
4. **Metadata Enrichment:**
   Query PostgreSQL to retrieve detailed records for the collected `device_id`s and `error_code`s using optimized set lookups (`device_id = ANY($1)`).
5. **In-Memory Stitching:**
   Construct a hash map of device metadata and error metadata in the Service layer. Iterate through the ClickHouse rows and append `device_details` and `error_details` using $O(1)$ lookups.
6. **Output Mapping:**
   Map the enriched objects to the final API Response payloads.

---

## ⚡ Guardrails & Scan Lifecycles

To maintain high performance and prevent database out-of-memory (OOM) failures under heavy load, the backend enforces several runtime constraints:

### 1. Mandatory Time Window Cap (90 Days)
* **Rule:** The time difference between `from_time` and `to_time` cannot exceed **90 days**.
* **Rationale:** Restricting the query scope limits the amount of raw log bytes ClickHouse scans, maintaining sub-second performance.
* **Defaults:** If omitted, the query window defaults to:
  * `to_time`: Current timestamp (`now`).
  * `from_time`: 7 days prior to `to_time`.

### 2. Auto-Expansion of Date-Only Inputs
* **Rule:** Date-only string formats (e.g., `2026-06-15`) are expanded into standard UTC timestamps:
  * `from_time`: `2026-06-15` ➔ `2026-06-15T00:00:00.000Z`
  * `to_time`: `2026-06-15` ➔ `2026-06-15T23:59:59.999Z`

### 3. API Query Guardrails
* **Pagination Limits:** Pagination `limit` must be an integer between `1` and `1000`. Offsets must be greater than or equal to `0`.
* **Group By Caps:** Dynamic analytics query groupings are capped at a maximum of **3 columns** simultaneously.
* **Sorting Whitelist:** Dynamic sorting fields (`sort_by`) are strictly whitelisted to `time_created`, `severity`, `status`, and `count` to avoid SQL injection vulnerability.
* **Timeout & SLA:**
  * PostgreSQL query execution time limit: `5s`.
  * ClickHouse query execution time limit: `30s`.
  * Exceeding these limits triggers an immediate query abort and returns a `504 Database Timeout` response.
