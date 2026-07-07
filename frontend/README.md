<div align="center">

# 🖥️ NetTrace Frontend

React/Vite dashboard application for NetTrace NOC analytics.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

The frontend consumes the backend `/api/v1` contract through `src/services/generated/nettrace-api.ts`. It renders the dashboard, Alarm Explorer, export workflow, and Templates & Presets management screens.

## ⚡ Quick Start

```bash
npm install
npm run dev
```

The dev server binds to `127.0.0.1`. When the backend is not served from the same origin, set:

```bash
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

## 📜 Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server on `127.0.0.1` |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Preview the production build locally |

## 🛠️ Stack

| Area | Libraries |
| --- | --- |
| App shell | React 18, React Router |
| Build | Vite, TypeScript |
| Styling | TailwindCSS, `src/styles/tokens.css`, `tailwind-merge`, `clsx` |
| Server state | TanStack Query |
| Forms | React Hook Form, Zod |
| Charts | Recharts, ECharts |
| UI feedback | Lucide React, Sonner |

## 📁 Source Layout

```text
src/
├── components/          # shared and primitive UI components
├── features/dashboard/  # dashboard widgets, template drawer, widget settings
├── layouts/             # app shell and shared route layout
├── pages/               # Dashboard, Alarm Explorer, Export, Templates
├── routes/              # router configuration
├── services/generated/  # API client and backend DTO types
├── styles/              # global CSS and design tokens
└── utils/               # shared helpers such as column and preset payload encoding
```

## 📺 Main Screens

| Screen | What It Does |
| --- | --- |
| Dashboard | KPI cards, chart/table/heatmap widgets, widget settings, template application. Pie charts show the top 5 categories and group the rest as `Other`. |
| Alarm Explorer | Backend-backed search, filters, sort, pagination, alarm details |
| Export | Filtered CSV/XLSX/JSON export with selected columns |
| Templates | Template CRUD, reusable preset CRUD, widget/KPI count filters |

## ✨ Implemented Feature Flows

### 🚨 5.1. Alarm Management

The **Alarm Explorer** screen lets users inspect and analyze alarm records from `/alarms`. The page builds `QueryAlarmsParams` from the active UI state and calls `GET /api/v1/alarms`.

The implemented flow supports:

1. Filtering by time range, severity, status, device ID, device name, device type, vendor, station, station ID, province, and error code.
2. Backend-backed search by one selected field such as alarm ID, device ID, device name, device type, error code, error name, severity, status, description, or raw log.
3. Sorting by the backend-supported fields: timestamp or severity.
4. Offset/limit pagination and configurable page size.
5. User-selected table columns.
6. Metadata option loading through `GET /api/v1/metadata/options` for device type, vendor, and province dropdowns.
7. An alarm detail panel using the returned alarm row plus enriched `device_details` and `error_details`.

When filters, search, sort, columns, page, or page size change, TanStack Query refetches `GET /api/v1/alarms` with the updated query parameters.

### 📊 5.2. Dashboard Analytics

The **Dashboard** screen provides a customizable analytics view for alarm monitoring. The page is template-backed: if no template is active, it shows a no-template state. When a template is selected, `DashboardPage` stores it in the shared `AppLayout` outlet context and renders the widgets saved in that template.

The dashboard loads reusable configuration through:

- `GET /api/v1/templates`
- `GET /api/v1/presets`

The implemented dashboard supports:

1. KPI widgets for total alarms, active alarms, archived alarms, critical alarms, and affected devices. KPI widgets call `GET /api/v1/analytics/summary`.
2. Line, bar, and pie chart widgets. These widgets call `POST /api/v1/analytics/query`.
3. Table widgets for alarm rows. These widgets call `GET /api/v1/alarms`.
4. Heatmap widgets in weekday or calendar mode. These widgets call `POST /api/v1/analytics/heatmap`.
5. Widget configuration for date range, chart type, metric, group by, time bucket, heatmap mode, table columns, table page size, and table record limit.
6. Dashboard layout configuration through template/widget state, including widget order and span.
7. Pie chart grouping that shows the top 5 slices and groups remaining categories into `Other`.

When the user changes widget settings, the widget query key changes and TanStack Query refetches the matching API. When the user saves changes on an active template, the frontend calls `PUT /api/v1/templates/:id` and updates the local dashboard widget state.

### 🎨 5.3. Template And Preset Management

The **Templates & Presets** screen lets users create, edit, delete, filter, sort, and search dashboard templates and reusable widget presets.

The screen loads current data through:

- `GET /api/v1/templates`
- `GET /api/v1/presets`

The implemented management flow supports:

1. Template creation through `POST /api/v1/templates`.
2. Template editing through `PUT /api/v1/templates/:id`.
3. Template deletion through `DELETE /api/v1/templates/:id`.
4. Preset creation through `POST /api/v1/presets`.
5. Preset editing through `PUT /api/v1/presets/:id`.
6. Preset deletion through `DELETE /api/v1/presets`.
7. Template editor reuse through `TemplateEditorModal`.
8. Active-template display using the shared active template state from `AppLayout`.

After template or preset mutations, the page invalidates the affected TanStack Query caches so the template list, preset list, and dashboard preset options refresh from the backend.

### 📤 5.4. Data Export

The **Export Data** screen lets users export filtered alarm data from `/export`.

The implemented flow supports:

1. Selecting export format: CSV, XLSX, or JSON.
2. Selecting export columns.
3. Applying filters for time range, severity, status, device ID, device name, error code, device type, vendor, station, station ID, and province.
4. Selecting sort field, sort direction, and record limit.
5. Loading metadata option lists through `GET /api/v1/metadata/options`.
6. Submitting one `POST /api/v1/export` request.
7. Handling the response as a Blob and downloading it in the selected format.

## ⚖️ API Rules

- Use `nettraceApi` and exported types from `src/services/generated/nettrace-api.ts`.
- Do not invent endpoint paths, request fields, or response fields in UI code.
- Invalidate TanStack Query caches after mutations that affect templates or presets.
- `VITE_API_BASE_URL` is the only frontend API base URL switch.
- If `VITE_API_BASE_URL` points to a different origin, that frontend origin must be listed in the backend `CORS_ORIGINS` setting.

## 🖌️ Design Notes

- The implemented style is a dark NOC-focused interface with neon accent tokens.
- Prefer existing components in `src/components/ui` and `src/components/shared`.
- Use colors and spacing from `src/styles/tokens.css` and Tailwind config instead of hard-coded one-off values.
- Figma exports in `frontend/design/` are references for current screens; the implemented component and token system is the source of consistency.
