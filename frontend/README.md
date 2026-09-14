# Dental Innovation CRM - Frontend

React + TypeScript + Vite SPA for the Dental Innovation CRM.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (used by Vite dev proxy) | `http://localhost:8080` |

## Development

```bash
npm run dev
```

The dev server runs at http://localhost:5173 with API proxy to the backend.

## Build

```bash
npm run build
```

Output is in `dist/` directory.

## Auth API Contract

The frontend expects these API endpoints (Laravel Sanctum session-based):

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/login` | `{email, password}` | 204 + Set-Cookie |
| POST | `/api/logout` | - | 204 |
| GET | `/api/me` | - | `{id, name, email, role}` |

### User Roles

- `owner` - Full access, can delete patients/appointments
- `admin` - Full access, can delete patients/appointments
- `operator` - Limited CRUD, no delete permissions

### Error Responses

- `401` - Session expired or invalid credentials
- `422` - Validation errors with field details
- `429` - Rate limited (too many attempts)

## CORS Configuration (Backend)

The Laravel backend needs these settings for Sanctum cookie auth:

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'supports_credentials' => true,
```

```env
# .env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8080
SESSION_DOMAIN=localhost
```

## Testing Login

### With Mock API

You can test the UI without a backend by mocking fetch responses in the browser console or using a tool like MSW (Mock Service Worker).

### With Real Backend

1. Ensure Laravel backend is running at `http://localhost:8080`
2. Run database migrations and seeders
3. Use test credentials:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@dental.local | ChangeMe!Owner1 |
| Admin | admin@dental.local | ChangeMe!Admin1 |
| Operator | operator@dental.local | ChangeMe!Operator1 |

## Project Structure

```
src/
├── api/           # API client and auth functions
├── components/    # Reusable UI components
├── context/       # React context providers
├── pages/         # Route page components
├── types/         # TypeScript type definitions
├── router.tsx     # React Router configuration
├── App.tsx        # Root component
└── index.css      # Global styles
```

## Features

- Login page with email/password authentication
- Session-based auth with HttpOnly cookies (Sanctum)
- Protected routes with automatic redirect to login
- Responsive sidebar navigation
- Role-based UI (delete buttons hidden for operators)
- Italian UI labels for staff-facing screens
- Accessible with ARIA labels and keyboard navigation
