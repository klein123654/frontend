# ButuanSpaces Frontend

This is the Vue 3 client for the ButuanSpaces platform. It provides the UI for public browsing, buyer actions, publisher dashboards, and the admin workspace.

## Responsibilities

- Public property listing pages and search
- Authentication flows for login, registration, and password recovery
- Buyer saved-property and inquiry screens
- Owner, broker, and developer workspace experiences
- Admin moderation and reporting interfaces
- Real-time role-aware navigation and route guards

## Tech stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- PrimeVue components
- Vitest and Playwright for validation

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create or update environment variables

```bash
cp .env.example .env
```

Then set the API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

3. Start the app

```bash
npm run dev
```

The frontend is usually served at http://127.0.0.1:5173.

## Available commands

```bash
npm run dev
npm run build
npm run test:unit -- --run
npm run test:e2e
npm run lint
```

## Role-aware app flows

- Guest visitors can browse the public catalog and request access to create an account.
- Buyers can save listings and submit inquiries.
- Verified publishers can manage their listings from role-based workspaces.
- Admins access moderation screens for listings, users, reports, and inquiries.

## Security and production notes

- Route guards help UX, but all permission and ownership checks must remain in the Laravel API.
- Do not keep secrets in the frontend bundle.
- Use HTTPS and a trusted origin in production.
- Keep the API base URL aligned with the deployed Laravel backend.

## Related docs

- [../README.md](../README.md)
- [../docs/PROJECT_GUIDE.md](../docs/PROJECT_GUIDE.md)
