# ⚡ NetTrace Monorepo

Welcome to the **NetTrace** repository. This project is configured as a monorepo containing our high-performance analytics APIs, design documentation, and placeholders for future frontend development.

---

## 📂 Project Organization

```text
nettrace/
├── backend/            # Express.js, TypeScript, ClickHouse & PostgreSQL APIs
├── frontend/           # Placeholders for future web application (intentionally empty)
├── docs/               # Architecture, database models, and API workflows
├── docker/             # Container orchestration assets
├── .github/            # CI/CD workflow configurations
├── AGENTS.md           # Unified AI agent specifications and coding safety rules
└── README.md           # Monorepo setup and commands (this document)
```

For more detailed technical descriptions, refer to the documentation files:
* Project design and flow: [docs/project-structure.md](file:///Users/v.h.yen/Documents/Code_2026/viettel%20/noc_backend/docs/project-structure.md)
* Backend detailed specs: [backend/README.md](file:///Users/v.h.yen/Documents/Code_2026/viettel%20/noc_backend/backend/README.md) and [backend/AGENTS.md](file:///Users/v.h.yen/Documents/Code_2026/viettel%20/noc_backend/backend/AGENTS.md)

---

## 🚀 Workspace Setup & Commands

This project uses **npm workspaces** to manage packages. You can run all development, testing, and formatting tasks directly from the root of the repository.

### 1. Installation
Install all workspace dependencies from the root directory:
```bash
npm install
```

### 2. Start Development Server
Start the backend live-reloading nodemon dev server:
```bash
npm run dev
```

### 3. Run Test Suite
Execute the backend Jest unit and integration tests:
```bash
npm test
```

### 4. Build Code
Compile TypeScript into ES modules:
```bash
npm run build
```

### 5. Code Style & Linters
Check and fix code formatting and lint errors:
```bash
npm run lint
# Or format code directly
npm run format
```

### 6. Database Health Checking
Run the connection checker utility:
```bash
npm run db:check
```
