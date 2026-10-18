# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SaveMe Budget: Thai-first expense tracker (Next.js 16 App Router, React 19, Tailwind 4, PostgreSQL via `pg`). UI copy is Thai; production domain is `savemebudget.anysonnet.com`.

**Next.js here has breaking changes vs. older versions** (see `AGENTS.md`). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code. E.g. `middleware` is now `proxy.ts`.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run lint
npm run typecheck
npm test               # vitest: unit + DB integration (needs DATABASE_URL)
npx vitest run tests/unit.test.ts          # single file (no DB needed)
npx vitest run -t "isolation between users" # single test by name
npm run build
npm run db:check       # verify connection; creates the DB only if missing
npm run db:migrate     # apply db/schema.sql (idempotent, never drops)
```

Local `DATABASE_URL` lives in `.env.local` (git-ignored; `.env.example` is the template). Scripts load it via `--env-file-if-exists`; vitest loads it via `loadEnv` in `vitest.config.mts`.

## Architecture

- **No ORM.** `lib/db.ts` holds a global `pg.Pool` singleton; services in `lib/users.ts` and `lib/expenses.ts` run raw parameterized SQL. DATE columns are parsed as `'YYYY-MM-DD'` strings (type parser 1082) to avoid JS time-zone shifts. Schema is `db/schema.sql` using only `CREATE ... IF NOT EXISTS`; it runs via `scripts/migrate.mjs` (also at container start). Never add destructive migrations.
- **Auth is hand-rolled, DB-backed sessions.** `lib/users.ts` (register/authenticate/session records, scrypt hashes in `lib/password.ts`) is framework-free and is what tests exercise. `lib/session.ts` wraps it with the `savemebudget_session` httpOnly cookie, `getUser()` (request-memoized) and `requireUser()`. Only the sha256 of the token is stored.
- **Authorization rule:** every function in `lib/expenses.ts` takes `userId` (from `requireUser()`, never from client input) and filters on it in SQL. Server Actions (`app/actions/*`) call `requireUser()` themselves; `proxy.ts` is only an optimistic cookie-presence redirect for `/dashboard`.
- **Validation:** zod schemas in `lib/validation.ts` (Thai error messages) run server-side in actions. Money is stored as integer **satang** (`bahtToSatang`, `formatBaht`); expense dates are Bangkok calendar dates (`bangkokToday`, `monthRange` in `lib/format.ts`) and the "current month" total is computed from them.
- `server-only` is aliased to a stub in `vitest.config.mts` so `lib/*` can be imported by tests.
- `next.config.ts`: `output: "standalone"` for Docker; Cache Components was deliberately disabled (all pages are per-user/dynamic).
- Animations (card stack, `.rise`, `.bar`) are plain CSS in `app/globals.css` and must stay disabled under `prefers-reduced-motion`.

## Tests

`tests/flow.test.ts` is an integration test against the real DB: it creates uniquely named users and deletes only those in `afterAll` (never drop/reset databases).

## Deployment

Docker Compose (`caddy` + `app` + `db`) per `DEPLOY.md`; production env comes from a server-side `.env` (see `.env.production.example`). The `db` service must never publish a port, and never run `docker compose down -v`.
