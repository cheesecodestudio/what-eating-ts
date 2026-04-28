---
description: "Use when making any product-level change: adding features, routes, modules, data models, or resolving open questions. Instructs the agent to read docs/PRD.md for context and keep it updated after changes."
---

## Project Context

Before starting any non-trivial task, read [docs/PRD.md](../../docs/PRD.md).  
It contains: implemented scope, pending modules, data model, open questions, roadmap, and risks.

## Keeping the PRD Current

After completing work that changes product behavior, update `docs/PRD.md` in the same task:

| Change made | PRD section to update |
|---|---|
| Implemented a Coming Soon module | Move from §4.2 → §4.1; update §6 system state; update §12 acceptance criteria if applicable |
| Added a new API endpoint or table | Update §6.2 (backend endpoints) and/or §6.3 (data tables) |
| Changed or removed a feature | Update §4.1 and §7 (functional requirements) |
| Resolved an open question | Answer or remove from §13 |
| Identified a new technical risk | Add to §10.1 |

**Do not update the PRD** for: refactors, style fixes, dependency bumps, or bug fixes with no product-visible impact.
