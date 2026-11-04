# GoDaddy Deluxe PaaS deploy (MySQL + two apps)

This monorepo deploys as **two** Node.js apps. GoDaddy PaaS allows one root `package.json` per app.

| App | Folder | Existing app hint |
|---|---|---|
| API | [`backend/`](../backend/) | Reuse `e9nvsq1ao9` or create new |
| Frontend | [`frontend/`](../frontend/) | Create second published app |

## Prerequisites

1. MySQL Workbench can connect to `localhost:3306`.
2. Create empty database `house_of_bread` in Workbench.
3. Set local [`backend/.env`](../backend/.env) `DATABASE_URL` with your MySQL user/password (replace `YOUR_PASSWORD`).

## Local MySQL migrate (run after approving)

From `backend/`:

```bash
# 1) Confirm DATABASE_URL in .env points at MySQL house_of_bread
npx prisma migrate deploy
# or for first apply of the baseline folder:
npx prisma migrate resolve --applied 0_mysql_baseline
# only if you applied SQL manually; otherwise prefer:
npx prisma migrate dev --name mysql_baseline

npx prisma db seed
npx prisma generate
npm run build
```

Recommended first-time local apply (empty DB):

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

## API app env (GoDaddy UI)

Platform injects MySQL:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Also set:

| Variable | Example |
|---|---|
| `JWT_SECRET` | long random string |
| `ADMIN_BOOTSTRAP_EMAIL` | admin@… |
| `ADMIN_BOOTSTRAP_PASSWORD` | strong password |
| `CORS_ORIGIN` | `https://your-frontend-host` |
| `FRONTEND_URL` | same as frontend URL |
| `EMAIL_TRANSPORT` | `godaddy` |
| `GOOGLE_CLIENT_ID` | if using Google sign-in |
| `NODE_ENV` | `production` |

Do **not** upload `.env`. `start` runs `prisma migrate deploy` then `node dist/server.js`.

This repo is a monorepo. GoDaddy runs one app per upload, and `package.json` has to sit at the root of that upload. The GitHub Action zips **`backend/`** only (no `node_modules`, no `.env`) and publishes that zip. Connecting the whole GitHub repository in the hosting UI would build the workspace root, which is not this API.

## GitHub CI/CD

Workflow: [`.github/workflows/backend-godaddy.yml`](../.github/workflows/backend-godaddy.yml).

- Every push and pull request that touches `backend/` installs, builds, and runs tests.
- A push to `main`, or a manual **Run workflow**, uploads the backend and publishes it.

One-time setup in GoDaddy (CLI or hosting UI):

1. Create a Node.js app and attach managed MySQL. Note the app id (`NODEJS-…`).
2. Attach the app to the Web Hosting plan, then publish once so later deploys have a plan.
3. In the hosting UI, set the variables below for **publish** (and preview, if you use it). The platform sets `PORT` and the five `DB_*` values itself.
4. Create a Personal Access Token with `hosting.source:read`, `hosting.source:write`, and `hosting.deployment:execute`.
5. In the GitHub repo, add secrets:
   - `GDDY_PAT` — that token
   - `GODADDY_APP_ID` — the `NODEJS-…` id

After that, merging to `main` builds the API and publishes it. Preview and production share one MySQL database, so a publish runs `prisma migrate deploy` against that database.

Deploy settings if you upload a zip by hand:

- Zip the **`backend`** folder so `package.json` is at the top of the zip
- Exclude `node_modules`, `dist`, and `.env`
- Runtime: Node.js 22
- Attach managed MySQL to this app

## Frontend app env

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-api-host` (no trailing slash) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | same as Google OAuth client |

Deploy settings:

- Root: **`frontend`**
- `build` → `next build`, `start` → `node server.js` (binds `0.0.0.0` + `PORT`)

## Email

On PaaS, mail uses the loopback gateway (`127.0.0.1:2525`). Office365 SMTP will not work from the container. Attach/verify your domain in GoDaddy if you need a custom From address; otherwise the platform canonical sender is used.

Locally, `EMAIL_TRANSPORT=smtp` keeps Nodemailer + Office365.

## Google OAuth

In Google Cloud Console, add the **production frontend origin** (and any redirect URIs you use).

## Cookies / CORS

Production session cookies use `SameSite=None; Secure` so the browser sends them on cross-origin `credentials: "include"` calls from the frontend host to the API host. Set `CORS_ORIGIN` exactly to the frontend origin (scheme + host, no path).

## Smoke checklist

1. API health / login works against GoDaddy MySQL.
2. Register → verification email arrives.
3. Frontend calls API via `NEXT_PUBLIC_BACKEND_URL` (CORS + cookies).
4. Google sign-in (if enabled).

## Notes

- Postgres is no longer used for this deploy path.
- SQL Server Express is unsupported.
- Do not deploy the workspace root as a single app.
