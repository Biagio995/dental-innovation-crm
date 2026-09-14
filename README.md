# Dental Innovation CRM

CRM MVP for dental practices: patients, appointments, recalls, and communications.

## Stack

- **Backend**: Laravel 12.x / PHP 8.3+
- **Database**: PostgreSQL 16
- **Authentication**: Laravel Sanctum (session cookie, SPA-friendly)

## Requirements

- PHP 8.3+
- Composer 2.x
- PostgreSQL 16+
- Node.js 20+ (for frontend assets)

## Quick Start

### Local Development

1. **Clone and install dependencies**:
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

5. **Start the server**:
   ```bash
   php artisan serve --port=8080
   ```

### Docker (Staging)

```bash
docker compose up -d --build
docker compose exec app php artisan migrate --seed
```

App available at: http://localhost:8080

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

## API Documentation

OpenAPI specification available at: [`docs/openapi-auth.yaml`](docs/openapi-auth.yaml)

## Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## Project Structure

```
app/
├── Enums/
│   └── UserRole.php          # Role enum (owner, admin, operator)
├── Http/Controllers/Api/
│   └── AuthController.php    # Authentication endpoints
├── Models/
│   ├── Appointment.php       # Appointment model (placeholder)
│   ├── AuditLog.php          # Audit logging for sensitive actions
│   ├── Patient.php           # Patient model (placeholder)
│   └── User.php              # User model with role support
└── Policies/
    ├── AppointmentPolicy.php # Appointment authorization
    └── PatientPolicy.php     # Patient authorization
```

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

### Sanctum Configuration

For SPA authentication, configure the stateful domains:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8080,localhost:5173,your-spa-domain.com
```

## License

Proprietary - Dental Innovation S.r.l.
