# Database Migration Workflow

This project now supports an explicit migration workflow for schema changes.

## Why this exists

`db push --accept-data-loss` is useful for quick local iteration, but it does not create migration history.  
For production-grade changes, use explicit Prisma migrations so schema evolution is logged and repeatable.

## Commands

- Generate client:
  - `npm run db:generate`
- Create and apply migration locally:
  - `npm run db:migrate:dev -- --name <migration_name>`
- Apply committed migrations in deployment:
  - `npm run db:migrate:deploy`
- Local sync-only fallback (non-migration path):
  - `npm run db:push`

## Recommended deployment mode

Set `PRISMA_SCHEMA_MODE=migrate` in production environments to apply migrations via `migrate deploy`.

If `PRISMA_SCHEMA_MODE` is not set, the entrypoint defaults to `db push` for backward compatibility.

## Logging expectation

Every migration PR should include:

1. Migration name and intent
2. Backward compatibility notes
3. Rollback strategy (or explicit "restore from backup" note)
4. Any data migration scripts required
