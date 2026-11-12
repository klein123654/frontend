# End-to-End Testing

## Run Tests

Install dependencies and browser engines from `frontend/`:

```sh
npm install
npx playwright install --with-deps
```

Run the fully mocked suite, including Chromium, Firefox, WebKit, and Pixel 7 emulation:

```sh
npm run test:e2e
```

Run the route smoke coverage only:

```sh
npm run test:e2e:smoke
```

The Playwright web server starts Vite at `http://127.0.0.1:4174`; `baseURL` and the readiness URL use the same address. Core tests intercept application API calls and do not require Laravel, a database, storage credentials, mail, or AI credentials.

Live API integration checks are tagged `@integration` and skipped unless explicitly enabled. Set `E2E_LIVE=1` and optionally `E2E_API_URL` (defaults to `http://127.0.0.1:8000/api`), then run:

```sh
npm run test:e2e:integration
```

The integration test first checks `GET {E2E_API_URL}/properties`. It skips with the health-check reason if the API is unreachable or returns a server error. The current live subset verifies the public properties collection shape; it does not create data or require seeded accounts. Future live-auth/CRUD scenarios will require isolated seeded accounts and data.

On failures, Playwright retains screenshots and video and records a trace on the first retry. Reports are written to `test-results/` and `playwright-report/`.

## Traceability Matrix

| Route | Spec | Scenarios |
|---|---|---|
| `/` | `e2e/public/catalog.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search, route render, public-home axe scan |
| `/properties` | `e2e/public/catalog.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search, type/listing filters, reset, empty/loading/error, back navigation, axe scan |
| `/properties/:id` | `e2e/public/property-details.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Detail, save, inquiry validation/submission, not-found/error, axe scan |
| `/report-issue` | `e2e/support/report-issue.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Required fields, optional email validation, submit/error, axe scan |
| `/login` | `e2e/auth/auth.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Required credentials, API failure, five role destinations, guest redirect, suspended/wrong-role redirects, axe scan |
| `/register` | `e2e/auth/auth.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Required fields, email/phone/password/confirmation/terms validation, success, axe scan |
| `/forgot-password` | `e2e/auth/auth.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Invalid email, request success/API error, axe scan |
| `/reset-password` | `e2e/auth/auth.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Incomplete link, confirmation validation/loading, success, axe scan |
| `/buyer/dashboard` | `e2e/routes/route-smoke.spec.ts` | Redirect to `/` |
| `/buyer/properties` | `e2e/routes/route-smoke.spec.ts` | Redirect to `/properties` |
| `/buyer/properties/:id` | `e2e/routes/route-smoke.spec.ts` | Redirect to `/properties/:id` |
| `/buyer/saved-properties` | `e2e/buyer/account.spec.ts`, `e2e/routes/route-smoke.spec.ts` | List/remove, empty/loading/error |
| `/buyer/inquiries` | `e2e/buyer/account.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Status, conversation/reply, empty list |
| `/publisher/apply` | `e2e/publisher/application.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Existing status, submission, required broker license, API validation |
| `/owner/dashboard` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Dashboard/navigation, axe scan |
| `/owner/properties` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status filter, delete confirmation |
| `/owner/properties/create` | `e2e/workspace/listings.spec.ts`, `coverage.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Draft, required validation, mocked image upload, submit for review |
| `/owner/properties/:id/edit` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Prefill/update draft |
| `/owner/properties/:id` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Detail and return navigation |
| `/owner/inquiries` | `e2e/workspace/listings.spec.ts`, `coverage.spec.ts`, `e2e/routes/route-smoke.spec.ts` | List, empty state, inquiry conversation/reply |
| `/developer/dashboard` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared dashboard/navigation, axe scan |
| `/developer/properties` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared search/status filter/delete |
| `/developer/properties/create` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared draft, validation, upload, review submission |
| `/developer/properties/:id/edit` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared edit |
| `/developer/properties/:id` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared details/navigation |
| `/developer/inquiries` | `e2e/workspace/listings.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Shared inquiry reply |
| `/broker/dashboard` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Navigation/verification link, axe scan |
| `/broker/listings` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status filter, detail navigation, empty fixture via shared queue coverage |
| `/broker/listings/create` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Required validation and draft save |
| `/broker/listings/:id/edit` | `e2e/routes/route-smoke.spec.ts` | Guard and edit-view landmark |
| `/broker/listings/:id` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Draft detail rendering |
| `/broker/inquiries` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search, details, status change, empty/error |
| `/broker/profile` | `e2e/broker/workspace.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Verification submit, load/submit errors, status |
| `/admin/dashboard` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Dashboard and axe scan |
| `/admin/properties` | `e2e/admin/moderation.spec.ts`, `coverage.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status, details, approve/reject and rejection validation |
| `/admin/users` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/role filter, suspend, empty state |
| `/admin/verifications` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status, detail, verify action |
| `/admin/publisher-applications` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Status filter, detail, reject-note validation and rejection |
| `/admin/inquiries` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status, details, status mutation |
| `/admin/reports` | `e2e/admin/moderation.spec.ts`, `e2e/routes/route-smoke.spec.ts` | Search/status, details, resolve action, API error |

`tests/coverage.spec.ts` preserves the twelve original named coverage scenarios, now using centralized fixtures and Page Objects. `tests/smoke.spec.ts` preserves the critical admin/broker/owner workspace smoke path using shared role helpers and Page Objects. The route smoke registry asserts all 40 router entries, including the three redirects.

## Mocked API Surface

Static records live in `tests/fixtures/test-data.ts`. `tests/fixtures/api-fixtures.ts` defines endpoint defaults and `success`, `empty`, `error`, `loading`, and `validation` overrides. `tests/helpers/api-mocks.ts` installs the API and external image/map stubs. Each test gets an isolated browser context; no shared mutable test database is used.

`PATCH /api/inquiries/{id}` is the actual admin inquiry status endpoint: the frontend calls `updateInquiryStatus()` in `src/services/inquiryService.ts`, and Laravel registers that route inside its authenticated API group. Broker listing operations call the same `fetchMyListings` / create / update / delete functions in `src/services/propertyService.ts` as publisher listing workflows, using `/api/my/properties*`.

## Validate Against Live API

The fixture shapes below are inferred from frontend service types, request handling, and Laravel route definitions. Validate each against a healthy backend before treating mocks as an API contract:

- `POST /api/login` and `POST /api/register`: `{ token, user, message? }`; `GET /api/user`: `{ user }`.
- `GET /api/properties`: `{ data: Property[], meta?: { current_page?, last_page?, per_page?, total? } }`; `GET /api/properties/{id}`: `{ data: Property }`.
- Property record: `id`, `title`, `property_type`, `listing_type`, `description`, `price`, location fields, coordinates/area, `status`, `created_at`, optional `images[]`, `ai_tags`, owner/broker. Image fields: `path`, optional `alt_text`, `sort_order`, `is_primary`.
- `GET /api/my/properties`: `{ data: Property[], meta? }`; `POST /api/my/properties` and multipart `POST /api/my/properties/{id}` (with `_method=PATCH`): `{ data: Property }`; delete/saved-property mutations: success JSON or empty success response as the UI ignores the body.
- `GET /api/my/saved-properties`: `{ data: Property[] }`.
- `GET /api/my/inquiries`, `GET /api/my/inquiries/sent`, `GET /api/admin/inquiries`: `{ data: Inquiry[] }`. Inquiry fields include `id`, `property_id`, `name`, `email`, `message`, `status`, `created_at`, optional `property`, `ai_summary`, and `ai_priority`.
- `GET /api/inquiries/{id}/messages`: `{ data: Message[] }`; `POST` to the same route: `{ data: Message }`. Message fields include `id`, `inquiry_id`, `sender_id`, `body`, `created_at`, `sender`.
- `PATCH /api/inquiries/{id}`: frontend expects `{ data: Inquiry }` although its response body is ignored after success.
- `GET /api/my/publisher-application`: `{ data: Application | null }`; its `POST` and `PATCH /api/admin/publisher-applications/{id}` expect `{ data: Application }`. Application fields include requested role, status, applicant, review details, and timestamps.
- `GET /api/broker/verification`: `{ data: Verification | null }`; submit response body is ignored by the current UI. Admin verification list: `{ data: Verification[] }`.
- Admin collection routes (`properties`, `users`, `verifications`, `publisher-applications`, `inquiries`, `reports`): `{ data: Record[] }`; `GET /api/admin/dashboard`: `{ data: Record<string, number> }`. Admin list-record field names are mapped in `src/stores/adminWorkspace.ts` and `src/services/adminService.ts`.
- `POST /api/properties/{id}/inquiries`: frontend expects `{ data: { id } }`; `POST /api/reports` and `POST /api/properties/{id}/reports` responses are ignored.
- `POST /api/ai/describe`, `POST /api/ai/search`, and `GET /api/ai/market-insight`: mocked for deterministic UI; AI response shapes and provider behavior are not validated by these tests.
- Validation/error responses: frontend normalizes Laravel-style `{ message, type, errors }`; exact validation keys/messages and status codes should be confirmed against live validation rules.

## Known Gaps and Assumptions

- `/properties` currently exposes search and filters but no pagination control. The route fetches a bounded result set, so there is no user pagination interaction to assert; pagination is intentionally not fabricated in the tests.
- Listing image uploads are submitted to a mocked multipart handler. Supabase/object-storage credentials, image persistence, and rendered production image URLs are not tested.
- AI search, description generation, and market insight are mocked. No external AI provider is contacted.
- Password reset email delivery is not tested; the UI/API request is mocked. Live integration does not currently require seeded user accounts.
- Map tiles and stored images are stubbed in browser tests. Tests assert the map’s accessible application role and name and simulate a map click for listing coordinates.
- There are no `data-testid` additions. The map has an accessible name; repeated row actions include record-specific accessible names. Normal role/name/label selectors are used.
- The API response shapes in the preceding section are inferred and must be checked against Laravel serialization with live data.
- Playwright projects multiply the core suite across Chromium, Firefox, WebKit, and mobile Chromium. Browser-specific engine behavior may expose genuine application differences; tests do not alter app code to conceal them.
- **App issue: broker draft-save announcement.** `src/views/broker/CreateBrokerListingView.vue` redirects after a successful save but does not expose a `role="status"` announcement. The corresponding status assertion is marked `test.fixme` in `tests/e2e/broker/workspace.spec.ts` until the application provides an accessible success announcement or the expected interaction is clarified.

## App Bugs Found by Tests

- **html-has-lang** — `frontend/index.html` has an empty `lang` attribute (`<html lang="">`). One-line fix: change it to `<html lang="en">`. This violation appeared on all twelve axe-scanned pages. Their axe checks are marked `test.fixme` with references to this section; the rule remains enabled.
- **Broker inquiry status control** — PrimeVue `<Select>` with `id="broker-inquiry-status"` is not reachable by its `<label for="broker-inquiry-status">Inquiry Status</label>` in the accessibility tree. The rendered combobox is announced by its current value (for example, “In Progress”) instead of its purpose, so screen readers cannot tell users what the control does. Fix: PrimeVue Select needs `:inputId="broker-inquiry-status"` (or equivalent) so the label targets the rendered input. File: `frontend/src/views/broker/BrokerInquiriesView.vue`. The test currently uses `getByRole('combobox', { name: /in progress/i })` as a workaround; this will break if the fixture status value changes. Once the app is fixed, revert to `getByLabel('Inquiry Status', { exact: true })`.
- **Login inline validation announcement** — Empty-credential validation displays inline email/password errors without `role="alert"`, so screen readers may not announce the errors when submission is rejected. The empty-credentials assertion is marked `test.fixme` in `tests/e2e/auth/auth.spec.ts` until the app exposes an appropriate live announcement.
- **color-contrast — design review needed.** The axe rule is `color-contrast` (WCAG 2 AA, expected minimum 4.5:1). It appeared on the admin and broker dashboards. Distinct affected targets and measured ratios:
	- `.sidebar-heading > p` — 2.56:1 (foreground `#94a3b8`, background `#ffffff`).
	- `.navigation-title` — 2.56:1 (`#94a3b8` on `#ffffff`).
	- `.profile-info > span` — 2.56:1 (`#94a3b8` on `#ffffff`).
	- `header > div > p` — 4.43:1 (`#64748b` on `#f5f7fb`).
	- `.recent-info > small:nth-child(2)` — 2.56:1 (`#94a3b8` on `#ffffff`).
	- `small:nth-child(3)` — 2.56:1 (`#94a3b8` on `#ffffff`).
	- `.status` — 4.34:1 (`#64748b` on `#f1f5f9`).
	- `.quick-link[href$="create"] > span > small` — 2.45:1 (`#94a3b8` on `#f8fafc`).
	- `.quick-link[href$="listings"] > span > small` — 2.45:1 (`#94a3b8` on `#f8fafc`).
	- `.quick-link[href$="inquiries"] > span > small` — 2.45:1 (`#94a3b8` on `#f8fafc`).
	- `.quick-link[href$="profile"] > span > small` — 2.45:1 (`#94a3b8` on `#f8fafc`).
	These are grouped under the `color-contrast` rule and tagged **design review needed**. The admin and broker dashboard axe checks are `test.fixme` until the contrast issue is addressed; the rule remains enabled.

## Out of Scope: Unrouted Views

These Vue files are not registered in `src/router/index.ts` and are intentionally excluded:

- `src/views/public/AboutView.vue`
- `src/views/public/ContactView.vue`
- `src/views/buyer/BuyerDashboardView.vue`
- `src/views/buyer/BuyerPropertiesView.vue`
- `src/views/buyer/BuyerPropertyDetailsView.vue`
- `src/views/admin/ManagePropertiesView.vue`
- `src/views/admin/ManageUsersView.vue`
- `src/views/admin/ReportsView.vue`
- `src/views/admin/VerificationView.vue`
