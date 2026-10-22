# Backend Setup

## Local database URL

Put the MySQL connection string in `backend/.env` as `DATABASE_URL`. Prisma reads that variable from the schema. Encode `@` in the password as `%40`.

```text
mysql://USER:PASSWORD@127.0.0.1:3306/house_of_bread
```

## Recommended local steps

1. Create the database `house_of_bread` in MySQL Workbench.
2. Set `DATABASE_URL` in `backend/.env`.
3. Apply pending migrations with:

```bash
cd backend
npm run db:migrate
```

After a schema change, create a new migration with:

```bash
cd backend
npm run db:migrate:dev
```

5. Run the backend seed script (local only — it truncates every table):

```bash
cd backend
npm run seed
```

## Deployment

The backend is a single long-running Node.js 22 process started with `npm start` (`node dist/server.js`).

- `npm run build` runs `prisma generate` and compiles TypeScript to `dist/`. Both `prisma` and `typescript` are regular dependencies so the build works on the host even when devDependencies are skipped.
- All configuration comes from environment variables and is validated at startup (`src/config/env.ts`); the process exits with a clear message if anything required is missing.
- The app binds to `process.env.PORT` on `0.0.0.0`, trusts one proxy hop in production, and never writes to local disk. Logs are JSON on stdout.
- `GET /health` returns `200 {"ok":true}` when the database is reachable, otherwise `503`.
- Apply schema changes with `npm run db:migrate` (`prisma migrate deploy`) against the production database before starting the new build.

See [`DEPLOYMENT.md`](../DEPLOYMENT.md) at the repository root for the GoDaddy Node.js Hosting guide, checklists, rollback, and troubleshooting.
