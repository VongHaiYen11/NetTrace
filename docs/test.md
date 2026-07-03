# Test Summary

This project currently includes backend unit tests for validation, service behavior, repository query construction, dashboard template logic, preset management, shared utilities, and functional API behavior. The test suite is implemented with Jest and TypeScript through `ts-jest`.

## Test Framework

| Area | Tool |
| --- | --- |
| Test runner | Jest |
| TypeScript support | ts-jest |
| Runtime environment | Node.js |
| Test location | `backend/src/tests` |
| Backend test command | `npm test -w backend` |
| Root test command | `npm test` |

## Existing Test Files

| File | Purpose |
| --- | --- |
| `backend/src/tests/validators.spec.ts` | Tests Zod validators, query/body parsing, default values, allowed values, and invalid input handling. |
| `backend/src/tests/services.spec.ts` | Tests service-layer business logic with mocked repositories, including alarm enrichment, metadata filter resolution, analytics aggregation, heatmap mapping, and export behavior. |
| `backend/src/tests/query-alarms.repository.spec.ts` | Tests ClickHouse query-shape behavior for alarm queries, including selected columns, count skipping, normalized filters, and backend search SQL generation. |
| `backend/src/tests/template.spec.ts` | Tests dashboard template validation and template service transaction behavior using mocked PostgreSQL dependencies. |
| `backend/src/tests/preset.service.spec.ts` | Tests preset service normalization and delete guards with mocked preset repository dependencies. |
| `backend/src/tests/utils.spec.ts` | Tests shared utility behavior for date chunking, metadata TTL cache, and chart-type preset field normalization. |
| `backend/src/tests/api.functional.spec.ts` | Tests important Express API endpoints through Supertest with mocked repository/database dependencies. |

## What Is Covered

### Validation Tests

The validation tests check:

- Time range parsing and default ranges
- Date-only expansion to full-day ranges
- Invalid time range rejection
- Alarm query defaults and limits
- Supported alarm search fields
- Analytics metric and `group_by` validation
- Heatmap mode validation
- Export format validation
- Metadata options query validation
- Preset and template schema validation

### Service Tests

The service tests check core backend behavior without requiring real databases:

- Alarm query service calls ClickHouse and enriches rows with PostgreSQL metadata
- Metadata filters such as `device_type`, `vendor`, `station`, and `province` are resolved before ClickHouse queries
- Backend search resolves federated fields through PostgreSQL when needed
- Summary metrics are aggregated correctly
- Analytics query results are grouped and merged correctly
- Heatmap rows are converted into frontend-friendly response shapes
- Export service behavior is validated with mocked streams and dependencies
- Preset creation and update normalize chart-specific fields before repository writes
- Preset deletion is blocked when a preset is already used by a template
- Unused presets are delegated to the repository delete path

### Repository Tests

The repository tests focus on SQL/query construction safety and performance behavior:

- `include_total=false` skips the count query
- Only requested direct columns are selected
- Required ID columns are included when metadata columns are requested
- Normalized filter columns are used instead of `lower(column)`
- Whitelisted backend search is translated into ClickHouse query conditions

### Template Tests

The template tests check:

- Template create/update schema validation
- Template ID parameter validation
- Pagination limits for template listing
- Atomic transaction behavior during template creation
- Rollback behavior when template creation fails
- Preset/widget linking during template creation

### Utility Tests

The utility tests check:

- Long date ranges are split into contiguous ClickHouse-safe chunks
- Short date ranges remain a single chunk
- Metadata cache keys are case-insensitive
- Metadata cache entries expire after their TTL
- Line, table, heatmap, and bar presets keep only the fields relevant to their chart type

### Functional API Tests

The functional API tests use Supertest against the Express application while mocking repository and database dependencies. They check:

- Unknown API routes return the standard `NOT_FOUND` envelope
- Metadata options API success and validation failure
- Alarm query API success and validation failure
- Summary analytics API success
- Generic analytics query API success and validation failure
- Heatmap API success
- Export API validation failure
- Template list, detail, not-found, and invalid ID cases
- Preset list, delete, and invalid update ID cases

## How To Run Tests

Run all backend tests from the repository root:

```bash
npm test -w backend
```

Or use the root workspace script:

```bash
npm test
```

## Current Test Scope

The current suite is mainly a **unit test suite** with a focused Supertest-based functional API layer. Tests use mocked repositories, mocked database clients, and mocked streams to keep execution deterministic and independent from ClickHouse or PostgreSQL.

## What Is Not Currently Covered

The codebase does not currently include:

- End-to-end tests for the frontend and backend together
- Browser/UI tests for the React application
- Tests that require live ClickHouse or PostgreSQL connections
- Controller-only unit tests for response envelope details
- Repository query-shape tests for summary, analytics, heatmap, template, preset, and widget repositories

## Notes

- The backend test script is defined in `backend/package.json` as `jest --passWithNoTests`.
- The root `package.json` delegates `npm test` to the backend workspace.
- Frontend source code currently does not include a dedicated test runner or frontend test files.
- Existing tests are deterministic because they mock external database and stream dependencies.
- Functional API tests use Supertest but do not require ClickHouse or PostgreSQL to be running.
