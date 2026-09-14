# Dental Innovation CRM

CRM MVP for dental practices: patients, appointments, recalls, and communications.

## Stack

- **Backend**: Laravel 12.x / PHP 8.3+ with Sanctum (session cookie auth)
- **Frontend**: React 19 + TypeScript + Vite 8
- **Database**: PostgreSQL 16

## Requirements

- PHP 8.3+
- Composer 2.x
- PostgreSQL 16+
- Node.js 20+ (for frontend)

## Quick Start

### Local Development

1. **Clone and install backend dependencies**:
   ```bash
   git clone https://github.com/Biagio995/dental-innovation-crm.git
   cd dental-innovation-crm
   composer install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Set up database**:
   Edit `.env` with your PostgreSQL credentials:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=dental_crm
   DB_USERNAME=dental
   DB_PASSWORD=your_password
   ```

4. **Run migrations and seed**:
   ```bash
   php artisan migrate --seed
   ```

5. **Start the backend**:
   ```bash
   php artisan serve --port=8080
   ```

6. **Start the frontend** (in a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker (Staging)

```bash
docker compose up -d --build
docker compose exec app php artisan migrate --seed
```

- Backend API: http://localhost:8080
- Frontend: http://localhost:5173

## Seeded Users (Staging/Development)

| Role     | Email                  | Password          |
|----------|------------------------|-------------------|
| owner    | owner@dental.local     | ChangeMe!Owner1   |
| admin    | admin@dental.local     | ChangeMe!Admin1   |
| operator | operator@dental.local  | ChangeMe!Operator1|

> **Note**: Seed credentials can be customized via environment variables. See `.env.example`.

## Authentication

This API uses **session-based authentication** with HTTP-only cookies (Laravel Sanctum SPA mode).

### Endpoints

| Method | Endpoint      | Description                          |
|--------|---------------|--------------------------------------|
| POST   | `/api/login`  | Authenticate (sets session cookie)   |
| POST   | `/api/logout` | Invalidate session                   |
| GET    | `/api/me`     | Get current user profile             |

### Login Example

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@dental.local","password":"ChangeMe!Admin1"}' \
  -c cookies.txt

# Use session cookie for authenticated requests
curl http://localhost:8080/api/me \
  -H "Accept: application/json" \
  -b cookies.txt
```

### Rate Limiting

Login attempts are rate-limited to **5 attempts per email+IP** combination.

## User Roles

| Role     | Description                                      |
|----------|--------------------------------------------------|
| owner    | Full access, can delete patients/appointments    |
| admin    | Can delete patients/appointments, admin functions|
| operator | Limited CRUD, cannot delete patients/appointments|

## Project Structure

```
dental-innovation-crm/
├── app/                          # Laravel backend
│   ├── Enums/UserRole.php        # Role enum (owner, admin, operator)
│   ├── Http/Controllers/Api/     # API controllers
│   ├── Models/                   # Eloquent models
│   └── Policies/                 # Authorization policies
├── frontend/                     # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── api/                  # API client and auth functions
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # React context providers
│   │   └── pages/                # Route page components
│   └── README.md                 # Frontend-specific documentation
├── docs/                         # Project documentation
│   └── openapi-auth.yaml         # OpenAPI specification
└── docker-compose.yml
```

## Documentation

- [Frontend README](frontend/README.md) - Frontend setup, API contract, and CORS config
- [OpenAPI Spec](docs/openapi-auth.yaml) - API documentation
- [Staging Guide](docs/staging.md) - Staging environment setup

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

### Sanctum Configuration

For SPA authentication, configure the stateful domains:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8080,localhost:5173,your-spa-domain.com
```

## Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## License

Proprietary - Dental Innovation S.r.l.
