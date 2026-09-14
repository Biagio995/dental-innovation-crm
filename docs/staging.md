# Staging — Dental Innovation CRM MVP

## Stack
- Laravel API + Sanctum (session cookie HttpOnly)
- PostgreSQL 16
- Frontend web (Vite) against APP_URL

## Local staging
```bash
docker compose up -d --build
# after Laravel bootstrap:
php artisan migrate --seed
```
App: http://localhost:8080

## Vite Frontend (SPA)

When running the Vite dev server for the SPA frontend:
- Vite runs on `http://localhost:5173`
- `SANCTUM_STATEFUL_DOMAINS` must include `localhost:5173` for cookie auth to work
- This is pre-configured in `.env.example` and `docker-compose.yml`

Example `.env` configuration:
```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8080,localhost:5173,127.0.0.1,127.0.0.1:8080
```

## Seed users
| Role | Email | Password |
|------|-------|----------|
| owner | owner@dental.local | ChangeMe!Owner1 |
| admin | admin@dental.local | ChangeMe!Admin1 |
| operator | operator@dental.local | ChangeMe!Operator1 |

## Notes
- Hosted staging URL published by IT after first Laravel bootstrap PR merges.
- Backup: nightly pg_dump on staging DB (to define with CI).
