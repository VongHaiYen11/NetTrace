<div align="center">

# 🌐 NetTrace NOC Analytics Platform

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=github)
![Docs](https://img.shields.io/badge/Docs-Updated-blue?style=for-the-badge&logo=markdown)
![Platform](https://img.shields.io/badge/Platform-Web-orange?style=for-the-badge&logo=googlechrome)

</div>

> This project was developed as a Mini Project for Viettel Digital Talent 2026.
> 
NetTrace is a Network Operations Center (NOC) analytics platform for exploring high-volume alarm events, monitoring operational KPIs, configuring dashboard templates, and exporting filtered incident data. 

> The frontend and backend are maintained in separate repositories, this repository is the central documentation and project overview hub.

---

## 📖 Table of Contents

- [🌐 NetTrace NOC Analytics Platform](#nettrace-noc-analytics-platform)
  - [📖 Table of Contents](#table-of-contents)
  - [🎯 Overview](#overview)
  - [✨ Key Features](#key-features)
  - [🏗️ System Architecture](#system-architecture)
  - [📁 Repository Structure](#repository-structure)
  - [🛠️ Technology Stack](#technology-stack)
  - [🚀 Getting Started](#getting-started)
    - [📋 Prerequisites](#prerequisites)
    - [⚙️ Installation](#installation)
    - [▶️ Running the Project](#running-the-project)


## 🎯 Overview

NetTrace provides a practical analytics workspace for NOC teams that need to inspect alarm records, understand incident distribution, track summary metrics, and prepare structured exports. The system separates the user-facing dashboard, the analytics API, and project documentation so each part can evolve independently while remaining aligned through shared API contracts and documentation.

## ✨ Key Features

- 📊 Dashboard-oriented alarm analytics and KPI summaries
- 🔎 Alarm exploration with filtering, sorting, search, and selectable display columns
- 🧩 Dashboard templates and reusable widget preset concepts
- 📈 Chart-ready analytics for line, bar, pie, top-N, grouped, and heatmap views
- 📤 Structured alarm export workflows for operational reporting
- 🗂️ Central documentation for architecture, setup, API behavior, and screenshots
- 🧱 Separate frontend and backend repositories for cleaner ownership and deployment

<details>
<summary><strong>Screenshot placeholders</strong></summary>

Add screenshots under `assets/` and replace these paths when ready:

```md
![Dashboard](./assets/dashboard.png)
![Alarm Explorer](./assets/alarm-explorer.png)
![Export Workflow](./assets/export-workflow.png)
```

</details>


## 🏗️ System Architecture

NetTrace follows a split-application architecture:

```text
User Browser
    |
    v
Frontend Application
    |
    v
Backend Analytics API
    |
    +--> ClickHouse      # high-volume alarm events and analytical queries
    |
    +--> PostgreSQL      # metadata, configuration, templates, widgets, presets
```

The frontend is responsible for the operator experience: dashboards, alarm tables, charts, template management, and export screens. The backend owns validation, API contracts, analytics queries, metadata enrichment, exports, and database access.


## 📁 Repository Structure

This root repository acts as the central project hub. The frontend and backend should be cloned from their own repositories.

```text
root
├── frontend -> separate repository
├── backend  -> separate repository
├── docs
├── assets
└── README.md
```

| Path | Purpose |
| --- | --- |
| `frontend` | Placeholder or local checkout for the separate frontend repository |
| `backend` | Placeholder or local checkout for the separate backend repository |
| `docs` | Architecture notes, API description, database notes, and project documentation |
| `assets` | Screenshots, diagrams, and visual assets for documentation |
| `README.md` | Main project overview and setup guide |

## 🛠️ Technology Stack

| Layer | Technology | Purpose | Notes |
| --- | --- | --- | --- |
| Frontend | React | Web application UI | See frontend repository |
| Frontend Tooling | Vite | Development server and production build | See frontend repository |
| Styling | Tailwind CSS | Utility-first UI styling | See frontend repository |
| Language | TypeScript | Type-safe frontend and backend development | Used across the project |
| Backend | Node.js, Express | HTTP API and routing layer | See backend repository |
| Validation | Zod | Request and schema validation | Backend API contracts |
| Logging | Pino | Structured backend logging | Backend observability |
| Analytics Database | ClickHouse | High-volume alarm storage and aggregations | OLAP workload |
| Relational Database | PostgreSQL | Metadata and dashboard configuration | OLTP workload |
| API Documentation | OpenAPI / Swagger | API contract documentation | Link placeholder below |

## 🚀 Getting Started

To run NetTrace locally, clone this documentation repository plus the separate frontend and backend repositories. This repository explains the project and keeps shared documentation, but the runnable applications live in their own codebases.

### 📋 Prerequisites

- Node.js
- npm
- Git
- Access to the frontend repository
- Access to the backend repository
- PostgreSQL database
- ClickHouse database

### ⚙️ Installation

```bash
# 1. Clone the root documentation repository
git clone <ROOT_REPOSITORY_URL>
cd <ROOT_REPOSITORY_NAME>

# 2. Clone the frontend repository
git clone <FRONTEND_REPOSITORY_URL> frontend

# 3. Clone the backend repository
git clone <BACKEND_REPOSITORY_URL> backend

# 4. Install frontend dependencies
cd frontend
npm install

# 5. Install backend dependencies
cd ../backend
npm install
```

> **Tip**
> Replace `<ROOT_REPOSITORY_URL>`, `<FRONTEND_REPOSITORY_URL>`, and `<BACKEND_REPOSITORY_URL>` with the actual GitHub repository URLs.

### ▶️ Running the Project

Run the backend API:

```bash
cd backend
npm run dev
```

Run the frontend application in a separate terminal:

```bash
cd frontend
npm run dev
```

Build for production:

```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```
