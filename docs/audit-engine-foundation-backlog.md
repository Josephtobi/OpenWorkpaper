# Audit Engine Foundation Backlog

This backlog operationalizes `CURSOR_BRIEF_engagement_flow.md` and `schema_additions.prisma` into deliverable batches.

Scope note: NGO-specific caption binding is explicitly deferred to Batch B2 (TB spine/leadsheet implementation), while NGO templates/questions ship in Batch A.

## Batch A - Template and Startup Reliability (Completed in this change set)

- Merge v2 corrections and Universal methodology additions into `Prefill_Questions_All.md`.
- Add v3 templates (Private School, NGO) in parser-safe format.
- Align `prisma/seed.mjs` to all new template/group/procedure keys.
- Ensure startup runs `db push -> db seed -> backfill-template-questions`.

Acceptance criteria:
- Canonical prefill contains 7 template headers.
- Seed contains matching 7 template definitions.
- `docker-entrypoint.sh` runs backfill in both Prisma binary and fallback paths.

## Batch B1 - Engagement Data Spine and Gate Skeleton

### Epic B1.1 - Schema foundation and explicit migrations
- Merge/add TB and risk-linkage models from `schema_additions.prisma` into `prisma/schema.prisma`.
- Introduce explicit migration workflow and deployment logging.
- Keep money fields as `Decimal` for all new financial models.

Acceptance criteria:
- Schema includes `TrialBalanceImport`, `TrialBalanceAccount`, `Grouping`, `Leadsheet`, `FieldBinding`, `Risk`, `RiskAssertion`, `ProcedureAssertion`, `RiskProcedureLink`.
- Migration artifacts are generated and applied without data loss in test environments.
- No new `Float` money fields are introduced.

### Epic B1.2 - Stage status and soft gates
- Add stage status tracking (Acceptance, Understanding, Risk, Materiality, Sampling, Fieldwork, Completion, Opinion).
- Implement soft-gate warnings with mandatory override reason logging.
- Preserve existing sign-off/lock behavior.

Acceptance criteria:
- Fieldwork stage warns when presumed/significant risks are not linked to procedures.
- Opinion stage warns when uncorrected misstatements exceed materiality (once rollup is available).
- Every override is persisted to `AuditLog`.

### Epic B1.3 - Forced tailoring enforcement
- Add mandatory "entity-specific matters not covered above" fields for key stage areas.
- Require explicit completion (including "none noted, considered") before stage completion.

Acceptance criteria:
- Tailoring prompt exists per required stage/area.
- Stage completion cannot be marked complete without explicit tailoring input.

## Batch B2 - TB Mapping and Number Binding Engine

### Epic B2.1 - Trial balance import and versioning
- Build APIs and UI for TB import (current-year/prior-year), with immutable import versions.
- Support mapping GL accounts to Grouping -> Leadsheet.

Acceptance criteria:
- Multiple imports per audit are versioned.
- Auditors can map/unmap accounts and lock approved mapping.

### Epic B2.2 - Leadsheet totals and field bindings
- Implement computed totals at grouping/leadsheet level.
- Bind procedure question fields to live totals via `FieldBinding`.
- Add recompute/caching flow for binding updates.

Acceptance criteria:
- Bound figures update when TB mappings/imports change.
- Procedure views display binding source and current value.

### Epic B2.3 - NGO caption binding (Deferred item)
- Add NGO-specific caption set binding (Income by fund, restricted/unrestricted funds, accumulated fund, deferred grants).
- Ensure NGO templates bind to NGO caption library instead of commercial captions.

Acceptance criteria:
- NGO engagements can select NGO caption profile.
- Leadsheets/captions render correctly for NGO fund accounting.

## Batch B3 - Risk, Materiality, and Sampling Hinge

### Epic B3.1 - Structured risk register
- Build risk CRUD using `Risk`, `RiskAssertion`, `RiskProcedureLink`.
- Auto-seed presumed ISA 240 risks (revenue recognition, management override), non-deletable and rebuttable with reason.

Acceptance criteria:
- Risk register is queryable by category/significance/assertion.
- Significant risks without linked procedures are surfaced as gate issues.

### Epic B3.2 - Engagement-level materiality record
- Add one materiality record per engagement (overall, performance, trivial, specific).
- Allow benchmark selection from TB/leadsheet-derived totals.

Acceptance criteria:
- Materiality values are stored once and reused downstream.
- Benchmark rebinding updates materiality calculations.

### Epic B3.3 - Sampling engine
- Add sampling plan per account area using risk rating + performance materiality + population.
- Show formula inputs and derivation transparently.
- Allow override with required rationale.

Acceptance criteria:
- Suggested sample size auto-calculates from configured logic.
- Overrides require comments and are logged.

## Batch B4 - Working Paper Anatomy and Completion Rollups

### Epic B4.1 - Working paper anatomy standardization
- Implement reusable anatomy (leadsheet header, assertions block, standard tests, sample link, misstatement capture, schedules, conclusion/sign-off, tailoring).
- Start with 6 core areas: PPE, Receivables, Inventory, Cash, Revenue, Payables.

Acceptance criteria:
- Each core area has structured working paper UI bound to spine/risk/sampling.
- Existing sign-off workflow still applies.

### Epic B4.2 - Misstatement aggregation and coverage matrix
- Create misstatement capture model and aggregate corrected/uncorrected schedules.
- Compute coverage matrix by leadsheet x assertion x completed procedures.

Acceptance criteria:
- Completion view shows aggregate misstatements versus materiality.
- Coverage gaps are highlighted for material captions/assertions.

## Batch B5 - Opinion and Export

### Epic B5.1 - Opinion-stage dependency on completion outputs
- Add opinion selection workflow fed from completion outputs (misstatements, going concern, key matters).

Acceptance criteria:
- Opinion decision references completion evidence.
- Modified-opinion prompts trigger when required by gates.

### Epic B5.2 - Connected Excel export
- Add per-working-paper export and full-file workbook export (index + completion summary).
- Export computed bound values with source annotations.

Acceptance criteria:
- Exports are generated from app state, not independent spreadsheets.
- Full workbook includes all working papers and completion summary sheets.
