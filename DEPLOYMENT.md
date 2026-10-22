# Deployment — House of Bread backend on GoDaddy Node.js Hosting

This guide covers the **backend** (`backend/`), an Express 5 + Prisma (MySQL) API that runs as one persistent Node.js 22 process. The Next.js frontend in `frontend/` is deployed separately and only needs `NEXT_PUBLIC_BACKEND_URL` pointed at the API.

Items marked **[Verify in GoDaddy dashboard]** are platform details that could not be confirmed from the code; check them in the hosting UI or with GoDaddy support rather than assuming.

---

## 1. Before you start

You need:

- A **MySQL database** reachable from the Node.js runtime (GoDaddy-provided MySQL or an external provider). Note host, port, database name, user, and password. The app must not point at `127.0.0.1`.
- An **SMTP account** that the host can reach on port 587 (or 465), or the decision to set `EMAIL_TRANSPORT=none` until it is available. Signup verification emails depend on this.
- The **Google OAuth client ID** if Google sign-in is used.
- The **public URL of the frontend** (for `CORS_ORIGINS` / `FRONTEND_URL`) and the hostname you will attach to the API (e.g. `api.yourdomain.com`).

Generate a fresh production `JWT_SECRET` (never reuse the development one):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 2. Step-by-step: GoDaddy Node.js Hosting

1. **Create the Node.js application** in the GoDaddy dashboard and choose **Deploy from GitHub**. Authorize GitHub and select the `Mintesnotg/Pastery` repository.
2. **Choose the branch** to deploy (e.g. `main`). Every push to that branch triggers a pull and restart.
3. **Set the application root / working directory.**
   - Preferred: `backend` — the app then uses `backend/package.json` directly.
   - If the platform only supports the repository root **[Verify in GoDaddy dashboard]**, leave it at the root. The root `package.json` delegates: `npm run build` installs backend dependencies and builds them; `npm start` starts the backend.
4. **Select Node.js 22.** The `engines` field in both `package.json` files declares `>=22`.
5. **Set the commands.**
   - Build: `npm run build` (runs `prisma generate` and compiles TypeScript to `dist/`). If the platform has no separate build step **[Verify in GoDaddy dashboard]**, change the start command to `npm run build && npm start`.
   - Start: `npm start`.
   - Do **not** add PM2, `cluster`, or a process manager; the platform supervises the single process.
6. **Add environment variables** in the dashboard (full list in section 3). Do not set `PORT`; the platform injects it. Set `NODE_ENV=production` unless the platform already does **[Verify in GoDaddy dashboard]**.
7. **Run database migrations** against the production database before the first start and after any schema change:
   ```bash
   # from your machine, with DATABASE_URL pointing at the production DB
   cd backend
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB" npx prisma migrate deploy
   ```
   This requires remote MySQL access to be allowed for your IP **[Verify in GoDaddy dashboard]**. If a web terminal exists for the app, you can run `npm run db:migrate` there instead. Never run `npm run seed` against production — it truncates every table.
8. **Deploy** (push to the chosen branch or click Deploy) and watch the build log for `Generated Prisma Client` and a successful `tsc` step.
9. **Attach the domain** (e.g. `api.yourdomain.com`) to the application and create the DNS record the dashboard asks for.
10. **Confirm SSL** is issued and HTTPS is enforced at the platform edge. The app assumes TLS terminates at the proxy and trusts one hop (`TRUST_PROXY=1`), so cookies are marked `Secure` and rate limiting sees real client IPs.
11. **Point the frontend at the API**: set `NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com` in the frontend's hosting environment and redeploy it. Add the production frontend origin to the Google OAuth client's authorized JavaScript origins if Google sign-in is used.

---

## 3. Environment variables

### Required in production

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Disables docs, enables secure cookies, hides error details |
| `DATABASE_URL` | `mysql://user:p%40ss@mysql.host:3306/house_of_bread` | Percent-encode `@` → `%40`, `#` → `%23` in the password |
| `JWT_SECRET` | *(48+ random chars)* | Min 32 chars; startup fails otherwise |
| `CORS_ORIGINS` | `https://www.yourdomain.com` | Comma-separated allowlist, no trailing slashes |
| `FRONTEND_URL` | `https://www.yourdomain.com` | Used in verification-email links |
| `SMTP_HOST` | `smtp.office365.com` | Required unless `EMAIL_TRANSPORT=none` |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | `false` = STARTTLS on 587, `true` = implicit TLS on 465 |
| `SMTP_USER` | `info@yourdomain.com` | |
| `SMTP_PASS` | *(secret)* | |
| `MAIL_FROM` | `House of Bread <info@yourdomain.com>` | Must be a sender the SMTP account may use |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Only if Google sign-in is enabled |

### Optional (defaults shown)

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address |
| `LOG_LEVEL` | `info` | pino level |
| `TRUST_PROXY` | `1` in production | Hops to trust for `X-Forwarded-*` |
| `COOKIE_SECURE` | `true` in production | Session cookie `Secure` flag |
| `COOKIE_SAME_SITE` | `lax` | Use `none` (+`COOKIE_SECURE=true`) only if the frontend is on a different site than the API |
| `JWT_EXPIRES_IN` | `15m` | Session lifetime |
| `DB_POOL_SIZE` | `3` | Prisma `connection_limit`; keep small on shared MySQL |
| `DB_POOL_TIMEOUT_SECONDS` | `10` | Wait for a free connection |
| `DB_CONNECT_TIMEOUT_SECONDS` | `10` | TCP connect timeout |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15-minute window |
| `RATE_LIMIT_MAX` | `300` | Requests per IP per window under `/api` |
| `AUTH_RATE_LIMIT_MAX` | `20` | Login, Google login, resend-verification, registration, contact form |
| `PUBLIC_CACHE_MAX_AGE` | `60` | Seconds of `Cache-Control` on anonymous storefront GETs; `0` disables |
| `ENABLE_DOCS` | `false` in production | Swagger UI at `/docs` |
| `EMAIL_TRANSPORT` | `smtp` | `none` disables outgoing email |

---

## 4. Pre-deploy checklist

- [ ] All **required** variables above are set in the dashboard; `PORT` is **not** set manually.
- [ ] `JWT_SECRET` is a new random value, not the development secret.
- [ ] Production MySQL is reachable from the host; `DATABASE_URL` uses the remote hostname and an encoded password.
- [ ] `npx prisma migrate deploy` has been run against the production database (`prisma migrate status` reports "up to date").
- [ ] `CORS_ORIGINS` and `FRONTEND_URL` contain the real frontend origin(s) with `https://`.
- [ ] Outbound SMTP from the host is confirmed, or `EMAIL_TRANSPORT=none` is set knowingly.
- [ ] Secrets that were ever shared in chats, screenshots, or terminals have been rotated: SMTP password, MySQL password, and the Google OAuth client secret (unused by the backend, but rotate it in Google Cloud Console as hygiene).
- [ ] `npm run build` and `npm run typecheck` pass locally on the commit being deployed.
- [ ] Node.js 22 is selected in the dashboard.

---

## 5. Post-deploy verification

- [ ] `curl -i https://api.yourdomain.com/health` → `200` and `{"ok":true}` (a `503` means the database is unreachable).
- [ ] `curl -I http://api.yourdomain.com/health` redirects to HTTPS at the platform edge, and the HTTPS response includes `strict-transport-security` and no `x-powered-by`.
- [ ] `curl -i -H "Origin: https://www.yourdomain.com" https://api.yourdomain.com/api/products` → `200` with `access-control-allow-origin: https://www.yourdomain.com` and `cache-control: public, max-age=60`.
- [ ] Logs show `backend listening` and `database connected` as JSON lines, with no `error`-level entries during normal traffic.
- [ ] Auth flow: register → verification email arrives → verify link signs in → `GET /api/auth/me` returns the profile with the `session` cookie (`HttpOnly; Secure; SameSite=Lax`).
- [ ] One DB-backed write works end to end (e.g. place a test order from the frontend and see it in the dashboard).
- [ ] `https://api.yourdomain.com/docs` returns `404` (docs disabled in production).

---

## 6. Rollback

1. In GitHub, identify the last known-good commit on the deploy branch.
2. Either **revert** the bad commit (`git revert <sha>` → push) or **reset** the branch to the good commit (`git push --force-with-lease origin <good-sha>:<branch>`) — reverting is safer when others share the branch.
3. The platform pulls and rebuilds; confirm `/health` returns `200`.
4. If the bad release included a **migration**, rolling back the code alone may not be enough. Prisma migrations are forward-only: write and deploy a new migration that reverses the schema change, or restore the database from the backup taken before the release.
5. If the dashboard offers "redeploy previous build" **[Verify in GoDaddy dashboard]**, use it for a faster code-only rollback.

---

## 7. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| App exits immediately; log shows `Invalid environment configuration:` | A required variable is missing or invalid (e.g. short `JWT_SECRET`, missing `CORS_ORIGINS`, `DATABASE_URL` not `mysql://`) | Add/fix the listed variables in the dashboard and restart |
| Build fails at `prisma generate` | Engine download blocked, or `postinstall` skipped | Check the build log for network errors; `prisma` is a regular dependency so `npm install` must not use `--ignore-scripts` |
| Build fails at `tsc` | Type error in the committed code | Run `npm run typecheck` locally; deploy only green commits |
| `EADDRINUSE` / "port already in use" | `PORT` was set manually to a value the platform does not route | Remove `PORT` from the dashboard; the platform injects it |
| Frontend gets CORS errors | Origin not in `CORS_ORIGINS`, or trailing slash / `http` vs `https` mismatch | Set the exact origin, e.g. `https://www.yourdomain.com` |
| Login succeeds but `GET /api/auth/me` is 401 | Cookie not sent cross-site | Same registrable domain: keep `lax`. Different domains: set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` |
| `/health` returns `503`; logs show `database connection failed` | Wrong host/credentials, remote access not allowed, or connection limit hit | Test the URL with `npx prisma db pull`; confirm remote-access rules; lower `DB_POOL_SIZE` |
| Prisma `P1001` / `ECONNREFUSED` | `DATABASE_URL` still points at `127.0.0.1` | Use the MySQL hostname provided by GoDaddy |
| Prisma `P3005`/`P3018` on migrate | Database not empty or migration already partially applied | Run `npx prisma migrate status`; resolve with `prisma migrate resolve` only after inspecting the DB |
| Verification emails never arrive; logs show `email send failed` with `ETIMEDOUT`/`ECONNECTION` | Host blocks outbound SMTP | Ask GoDaddy to allow port 587/465, use a provider on an allowed port, or temporarily set `EMAIL_TRANSPORT=none` |
| `email send failed` with `535` authentication error | Wrong SMTP credentials or Basic Auth disabled on the mailbox | Fix credentials; Microsoft is retiring Basic Auth for SMTP AUTH, so plan an OAuth2 or transactional-mail provider |
| `502 Bad Gateway` right after deploy | App still starting or crashed on boot | Wait for `backend listening` in logs; if absent, read the first error lines |
| Intermittent `502`/`503` under load | Memory cap reached or MySQL connections exhausted | Check memory graphs **[Verify in GoDaddy dashboard]**; lower `DB_POOL_SIZE`, raise `LOG_LEVEL` to `warn` to cut log volume |
| `429 Too many requests` for legitimate users | Many users behind one NAT IP hitting limits, or `TRUST_PROXY` wrong so every client looks like the proxy IP | Confirm `TRUST_PROXY=1`; raise `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` |
| Memory grows over days | Expected baseline is Node + Prisma engine (~100–150 MB). In-memory caches are bounded | If growth continues, lower `LOG_LEVEL`, and check for a platform-side restart policy |

---

## 8. Verify in GoDaddy dashboard

These were not verifiable from the code. Confirm each one once and record the answer here:

- Can the application root be set to `backend/`, or must it be the repository root?
- Is there a separate **build command** field, and does `npm install` run with devDependencies?
- Is `NODE_ENV=production` set automatically?
- How is `PORT` injected, and does the platform health-check a specific path?
- Does the runtime allow **outbound SMTP** on 587/465?
- MySQL: hostname to use from the app, remote-access/IP allowlist rules, and the per-user connection limit (size `DB_POOL_SIZE` below it).
- Memory limit per application and whether the process is restarted automatically on crash or OOM.
- Is exactly one process run per application? (Rate limits and caches are per process.)
- Is there a "redeploy previous build" option for rollback?
