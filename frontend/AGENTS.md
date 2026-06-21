# Frontend AGENT Instructions

## Purpose

This frontend is part of the NetTrace platform.

The frontend must faithfully implement approved Figma designs and consume existing backend APIs.

The backend API is the source of truth.

The Figma design is the source of truth for UI and UX.

---

# Design Sources

## Figma Design

The figma design is exported by .png file in design folder.
---

# Design System

The design system should follow the existing Figma project as the primary source of truth.

Use the Figma MCP server whenever available to inspect and extract:

* Typography and font usage
* Color palette and design tokens
* Spacing and layout rules
* Iconography
* Component variants and states
* Responsive behavior

Do not introduce new design tokens, colors, fonts, spacing scales, or icon styles unless they already exist in Figma or are explicitly approved.

When design details are unclear:

1. Inspect similar screens in Figma.
2. Inspect existing implemented components.
3. Follow established patterns.
4. Avoid introducing new design decisions.

Maintain visual consistency across all screens by reusing the design language already present in Figma.

---

# Technology Stack

## Core

* React
* TypeScript
* Vite

## Styling

* TailwindCSS
* tailwind-merge
* clsx

## Routing

* React Router

## Data Fetching

* TanStack Query (React Query)

## HTTP

* Generated API Client Only

## State Management

* React Context (when needed)
* Local component state by default

## Forms

* React Hook Form
* Zod

## Tables

* TanStack Table

## Charts & Data Visualization

* Recharts

## Date Handling

* date-fns

## Utilities

* lodash-es

## Notifications

* Sonner

## Icons

* Lucide React

---

# API Integration Rules

Backend APIs already exist.

Never create new API contracts.

Never create mock APIs.

Never create fake endpoints.

Always use existing generated API clients and hooks.

Always use backend DTOs and generated TypeScript types.

Backend OpenAPI specification is the source of truth.

If an API capability appears missing:

* Do not invent endpoints.
* Do not fabricate request payloads.
* Do not fabricate response fields.
* Surface the limitation clearly.

---

# Project Structure

Preferred structure:

src/
├── pages/
├── features/
├── components/
│ ├── ui/
│ └── shared/
├── hooks/
├── services/
├── types/
├── layouts/
├── routes/
└── utils/

---

# Component Architecture

Preferred principles:

* Reusable components first
* Thin pages
* Feature-oriented organization
* Separation of presentation and business logic

Rules:

* Move reusable logic into hooks
* Move reusable UI into components
* Avoid duplicated UI patterns
* Avoid duplicated business logic
* Avoid business logic inside presentation components

---

# UI Rules

Create reusable components whenever possible.

Avoid duplicated UI patterns.

Keep pages thin.

Move reusable logic into hooks.

Move reusable UI into components.

Do not place business logic inside presentation components.

Follow existing patterns before introducing new abstractions.

---

# Figma Implementation Rules

When implementing a Figma screen:

1. Read the design through images in the design folder.
2. Identify reusable components.
3. Reuse existing components before creating new ones.
4. Preserve spacing and hierarchy.
5. Match typography exactly.
6. Match colors exactly.
7. Match component states exactly.
8. Match interaction patterns exactly.
9. Match layout structure exactly.
10. Ensure responsive behavior.

Do not redesign screens.

Do not improve the design.

Do not introduce new UX patterns.

Do not invent layouts.

Desktop Figma implementation should be visually identical whenever possible.

---

# Responsive Design Rules

## Responsive Strategy

If responsive designs are not available in Figma:

The agent is responsible for creating responsive behavior using established SaaS and dashboard design conventions.

Priority:

1. Preserve usability
2. Preserve information hierarchy
3. Preserve visual consistency
4. Preserve design language
5. Preserve desktop fidelity

Desktop implementation must remain visually identical to Figma.

Responsive adaptations should only affect tablet and mobile layouts.

---

## Breakpoints

Use Tailwind default breakpoints:

* sm = 640px
* md = 768px
* lg = 1024px
* xl = 1280px
* 2xl = 1536px

Device categories:

* Mobile: < 640px
* Tablet: 640px–1023px
* Desktop: ≥ 1024px
* Large Desktop: ≥ 1440px

---

## Layout Adaptation

When responsive behavior is unspecified:

* Preserve content hierarchy.
* Preserve information architecture.
* Avoid horizontal scrolling.
* Convert horizontal layouts into vertical layouts.
* Maintain readable spacing.
* Maintain readable typography.
* Maintain accessibility.

Examples:

Desktop:

[KPI 1] [KPI 2] [KPI 3] [KPI 4]

Mobile:

[KPI 1]
[KPI 2]
[KPI 3]
[KPI 4]

---

## Grid Rules

Default responsive grids:

Desktop:

* 12-column grid

Tablet:

* 6-column grid

Mobile:

* 4-column grid

---

## Sidebar Behavior

Desktop:

* Persistent sidebar

Tablet:

* Collapsible sidebar

Mobile:

* Drawer sidebar

---

## Forms

Desktop:

* Multi-column layouts allowed

Tablet:

* Reduce columns where appropriate

Mobile:

* Single-column layouts preferred

Requirements:

* Inputs must remain easily tappable.
* Labels must remain visible.
* Validation messages must remain readable.

---

## Dialogs

Desktop:

* Centered modal

Tablet:

* Modal or sheet

Mobile:

* Full-screen sheet or drawer

---

## Buttons

Desktop:

* Content-width buttons

Mobile:

* Full-width when appropriate

Maintain touch-friendly sizing.

---

## Cards

Desktop:

* Multi-column layouts

Mobile:

* Vertical stacking

---

## Tables

Tables must remain usable on mobile.

Preferred adaptation order:

1. Horizontal scrolling container
2. Column priority hiding
3. Card representation

Do not remove important data unless explicitly specified.

---

## Dashboard Responsive Requirements

Desktop is the primary target.

Tablet must be fully supported.

Mobile must remain functional.

Requirements:

* KPI cards stack vertically.
* Filters collapse when necessary.
* Charts resize automatically.
* Tables remain usable.
* Sidebar becomes drawer.
* Navigation remains accessible.

Do not create separate mobile experiences unless explicitly requested.

---

# Typography Rules

Follow Figma typography exactly on desktop.

If responsive typography is unspecified:

Desktop:

* Match Figma exactly

Tablet/Mobile:

Scale proportionally.

Recommended fallback:

* H1: 32 → 24
* H2: 24 → 20
* H3: 20 → 18
* Body: 16 → 14

Maintain visual hierarchy.

---

# Chart & Visualization Rules

Charts are first-class UI elements.

Preferred library:

* Recharts

Requirements:

* Responsive by default
* Accessible
* Reusable
* Typed props
* Consistent formatting

Create reusable chart wrappers.

Examples:

* Line Chart
* Area Chart
* Bar Chart
* Stacked Bar Chart
* Pie Chart
* Donut Chart
* Trend Charts
* KPI Cards
* Time Series Charts

Avoid chart-specific business logic.

Charts should receive data via props.

---

## Responsive Chart Behavior

On smaller screens:

* Reduce tick density.
* Reduce label density.
* Preserve readability.
* Preserve tooltip functionality.
* Avoid clipping.
* Avoid overlapping labels.

---

# State Management Rules

Default:

* Local component state

Use React Context only when state sharing is required.

Avoid unnecessary global state.

Server state must use React Query.

---

# Data Fetching Rules

Always use React Query.

Requirements:

* Proper caching
* Loading states
* Error states
* Retry strategy when appropriate

Avoid duplicate requests.

---

# Performance Rules

Use React Query caching.

Avoid unnecessary re-renders.

Use memoization only when justified.

Prefer composition over premature optimization.

Lazy-load routes when appropriate.

Avoid large component trees when unnecessary.

Avoid expensive computations inside render.

---

# Accessibility Rules

Use semantic HTML.

Requirements:

* Labels for form controls
* Keyboard accessibility
* Visible focus states
* Accessible tables
* Accessible charts where possible
* Sufficient color contrast

Support screen readers where possible.

---

# TypeScript Rules

Use strict TypeScript.

Requirements:

* No any
* No implicit any
* Strong typing everywhere
* Use generated API types
* Use DTOs from backend

Prefer explicit types when helpful.

---

# Code Quality Rules

Prefer readable code.

Avoid clever abstractions.

Avoid duplicated code.

Follow existing naming conventions.

Follow existing project patterns.

Maintain consistency across the codebase.

---

# Testing Considerations

When creating components:

* Keep components testable.
* Separate business logic from UI.
* Avoid side effects in rendering.

---

# Agent Restrictions

Do NOT:

* Create fake APIs
* Create mock APIs
* Create mock DTOs
* Create fake endpoints
* Invent backend fields
* Invent request payloads
* Invent response payloads
* Change existing API contracts
* Ignore Figma designs
* Redesign screens
* Introduce new UI libraries
* Introduce new design systems
* Introduce unapproved dependencies

Always prefer consistency over creativity.

Always follow backend contracts.

Always follow Figma.

Always preserve the established design language.
