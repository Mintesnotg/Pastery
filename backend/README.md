# Backend Setup

## Local database URL

Use this local Postgres connection string for the backend and pgAdmin:

```text
postgresql://postgres:postgres@127.0.0.1:5432/house_of_bread_prod
```

## Where to place it

- Backend runtime env: `backend/.env.local`
- Optional backend defaults: `backend/.env`
- Example values: `backend/.env.example`

## Recommended local steps

1. Create the database in pgAdmin named `house_of_bread_prod`.
2. Paste the connection string above into `backend/.env.local` as `DATABASE_URL=...`.
3. Apply the SQL migration in `backend/migrations/0000_initial_schema.sql`.
4. Run the backend seed script:

```bash
cd backend
npm run seed
```

