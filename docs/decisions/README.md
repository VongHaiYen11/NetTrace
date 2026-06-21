# Architecture Decision Records (ADRs)

This directory serves as the repository for all **Architecture Decision Records (ADRs)** for the NetTrace project.

## What is an ADR?
An ADR is a short text file that captures a single significant architectural decision, along with its context, options considered, and consequences. Recording these decisions ensures that future developers and AI agents understand the rationale behind the system's design and code constraints.

## Status & Naming Conventions
* **Naming:** Files in this directory should follow the format `XXXX-short-descriptive-title.md` (e.g. `0001-use-clickhouse-for-alarms.md`), where `XXXX` is a sequential 4-digit number.
* **Template:** Each record should clearly document:
  * **Title:** Number and descriptive name.
  * **Date:** When the decision was recorded.
  * **Status:** `Proposed`, `Accepted`, `Rejected`, or `Superseded`.
  * **Context:** The problem we are trying to solve and any technical background.
  * **Decision:** The chosen path/resolution.
  * **Consequences:** The impact (both positive and negative) of the choice.
