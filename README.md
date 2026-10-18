# SaveMe Budget

จัดการเงินง่ายขึ้น เหลือเงินเก็บมากขึ้น — a Thai-first expense tracker (Next.js App Router, PostgreSQL).

## Run locally

```bash
npm install
cp .env.example .env.local     # then set DATABASE_URL (this file is git-ignored)
npm run db:check               # verifies the connection; creates the DB only if missing
npm run db:migrate             # idempotent, never drops anything
npm run dev                    # http://localhost:3000
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test            # unit tests + DB integration tests (needs DATABASE_URL)
npm run build
```

Deployment: see [DEPLOY.md](./DEPLOY.md).
