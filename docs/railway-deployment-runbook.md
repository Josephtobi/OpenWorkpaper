# Railway Deployment Runbook (Engine B1-B5)

This runbook is the safe order for deploying template + engine changes on Railway.

## 1) Required environment variables

- `DATABASE_URL` (Railway volume-backed SQLite path)
- `JWT_SECRET`
- `PREFILL_QUESTIONS_FILE=/app/Prefill_Questions_All.md`
- `PRISMA_SCHEMA_MODE=migrate` (recommended for production)  
  - fallback: `push` (legacy compatibility)

## 2) Startup behavior

Entrypoint sequence (`docker-entrypoint.sh`):

1. schema apply (`migrate deploy` if `PRISMA_SCHEMA_MODE=migrate`, otherwise `db push`)
2. `db seed`
3. `node prisma/backfill-template-questions.mjs`
4. `node server.js`

Do not override start command with custom `sh -c` that skips entrypoint.

## 3) First deploy after schema changes

1. Build and deploy container with updated schema and routes.
2. Confirm logs show:
   - schema step completed
   - seed completed
   - backfill completed with replacement counts
3. Open app and verify tabs appear:
   - `Risk Engine`
   - `TB Mapping`
   - `Completion Engine`
   - `Opinion Engine`

## 4) Post-deploy smoke checks

- Create a new audit:
  - presumed risks (`FR-REV`, `FR-MGT`) should exist
- In `TB Mapping`:
  - import rows, create leadsheet/grouping, map account
- In `Risk Engine`:
  - save materiality, create sampling plan
- In `Completion Engine`:
  - add misstatement and verify summary updates
- In `Opinion Engine`:
  - save opinion decision
- Export workbook:
  - verify index, completion summary, misstatements, coverage matrix, and working-paper sheets

## 5) Recovery / rollback

- If schema migration fails:
  - fix migration and redeploy; do not force-reset production DB
- If seed/backfill fails:
  - keep service running disabled for user writes; fix parser/seed mismatch; redeploy
- Always retain volume snapshot before major schema rollout.

## 6) Known technical debt

- TypeScript project has pre-existing strict typing errors unrelated to this rollout.
- Current confidence gate for CI should rely on lint + runtime smoke tests until full TS strict cleanup is completed.
