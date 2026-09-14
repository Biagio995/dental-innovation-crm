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

## Seed users
| Role | Email | Password |
|------|-------|----------|
| owner | owner@dental.local | ChangeMe!Owner1 |
| admin | admin@dental.local | ChangeMe!Admin1 |
| operator | operator@dental.local | ChangeMe!Operator1 |

## Notes
- Hosted staging URL published by IT after first Laravel bootstrap PR merges.
- Backup: nightly pg_dump on staging DB (to define with CI).
