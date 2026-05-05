# BeaconU — Backend Rules & System Context (v1.0)

**1. Project Identity:** Multi-tenant college admission platform. 4 client apps (BeaconU App, Blink, College Web, College Admin) sharing one backend API. Students apply to colleges, take assessments, book interviews, pay fees, manage hostel/commute. Blink handles referrals, commissions, counselling. Each college gets its own portal scoped by `college_id`.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL (Prisma), Redis, BullMQ. Monorepo: Turborepo + pnpm workspaces. API Contract: OpenAPI (backend generates spec, web + Flutter generate clients).

**2. Monorepo Structure (Turborepo):**

```
apps/
  api/                  # Single Express backend serving all clients
  web/                  # BeaconU Launchpad + Student App (Next.js)
  college-web/          # College Web Portal for students (Next.js)
  college-admin/        # College Admin Panel (Next.js)
packages/
  db/                   # Prisma schema, migrations, client, seed
  types/                # Shared DTOs, enums, constants across apps
  validation/           # Shared Zod schemas
  utils/                # Pure utility functions (no DB, no side effects)
```

- Flutter app is a separate repo.
- All DB access goes through `packages/db`. Frontend apps NEVER import Prisma directly.
- `packages/types` is the only package frontends AND backend can both import.
- Backend is the single source of truth for all business logic. Frontends are thin API consumers.
- Backend generates OpenAPI spec → web + Flutter generate typed clients. Prevents API mismatch.

**3. Backend Module Structure:**

- **Style:** MVC + Service Layer + Split Data Access. No DDD, Clean Arch, CQRS.
- **Module location:** `apps/api/src/modules/<name>/`
- **Folder structure per module:**

```
modules/
  admissions/
    controllers/        # Route handlers — validate + call service + respond
    services/           # All business logic lives here
    repositories/       # Write operations + simple reads
    queries/            # Read-heavy operations (joins, aggregations, UI-ready DTOs)
    validators/         # Zod schemas for request validation
```

- **Shared (`apps/api/src/shared/`):** Middleware, error classes, auth helpers, logger, queue setup, redis client. Allowed cross-imports from any module.

**4. Split Data Access Pattern (CRITICAL):**

**Write flow:**

```
Controller → Service → Repository → DB
```

**Read flow:**

```
Controller → Query → DB
```

- **Repositories:** Used for writes + simple reads. Protect business logic, enforce rules. No complex joins.
- **Queries:** Used for read-heavy endpoints. Can include joins, aggregations, computed fields. Return UI-ready DTOs directly. No business logic.

**5. Layer Responsibility (STRICT):**

- **Controller:** DO: Zod validation via `.parse()`, call ONE service method OR ONE query, return HTTP response. DON'T: Business logic, direct DB calls, call multiple services, try/catch.
- **Service:** DO: All business logic, call own repository, call other module's services, use `prisma.$transaction`, Redis locks, throw `AppError`, map data to DTOs. DON'T: Direct Prisma queries (use repository), access `req`/`res`, return raw Prisma types across module boundaries.
- **Repository:** DO: Write operations (create, update, delete) + simple reads needed by business logic. Accept `tx` parameter for transactions. Return Prisma types to OWN service only. DON'T: Business logic, complex joins, call other repositories or services, throw business errors.
- **Query:** DO: Complex reads, joins, aggregations, computed fields. Return UI-ready DTOs directly to controller. Can use raw SQL or Prisma for performance. DON'T: Write operations, business logic, mutations.
- **Validators:** DO: Zod schemas for request validation, sanitization. DON'T: DB lookups, business rules.

**6. Module Interaction ("The One Rule"):**

- Modules communicate ONLY via Services. Never import another module's Repository, Query, or Prisma models. Cross-module data must be plain DTOs defined in `packages/types` or the consuming module.

**7. College Scoping (CRITICAL):**

- Every college-scoped request must include `college_id`. Frontend sends it (from portal context), backend validates it.
- Every college-scoped query MUST include `WHERE college_id = ...`. No exceptions.
- Staff session carries `collegeId` from their `staff_members.college_id`. Middleware verifies staff belongs to the correct college.
- Super Admin bypasses college scoping — can access all data.
- **5 separate identity tables:** `students`, `platform_admins`, `staff_members`, `blink_users`, `counsellors`. Auth middleware resolves user type from JWT `userType` claim and loads from the correct table.

**8. Authentication & Authorization:**

- **Students:** Google OAuth (BeaconU App only) + OTP via third-party (no OTP stored in DB). JWT access token (15 min) + refresh token (stored in `user_sessions`).
- **All other roles:** Email + Password. Same JWT pattern.
- **JWT payload:** `{ userId, userType, collegeId?, roleId?, permissions? }`
- **Middleware chain:** `authenticate` → `authorize(permissions[])` → controller.
- **RBAC:** `college_roles` + `college_role_permissions` table. Check via `authorize('applications.review')` middleware. Super Admin skips permission checks.
- **Multi-device:** Allowed for all user types. No session limit.

**9. Type Safety:**

- `strict: true` in tsconfig. No `any`, no `@ts-ignore`, no raw Prisma types across module boundaries.
- Explicit input/output types for all service and query methods.
- Controllers must use Zod `.parse()` — never trust raw `req.body`.

**10. Error & Response Handling:**

- Throw custom `AppError` subclasses from services: `NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`, `UnauthorizedError`.
- Central `errorHandler` middleware formats all responses. No try/catch in controllers.
- **Success:** `{ "success": true, "data": { ... }, "meta?": { pagination } }`
- **Error:** `{ "success": false, "error": { "code": "RESOURCE_NOT_FOUND", "message": "..." } }`

**11. Database Rules (Prisma + PostgreSQL):**

- Single Prisma schema in `packages/db/prisma/schema.prisma`.
- Use Prisma Migrate for all schema changes. Every change is a versioned migration. Never raw ALTER TABLE in production.
- **Soft Deletes Only:** Use `status` field (active/inactive/archived) or `is_active` boolean. Query accordingly — always filter.
- **JSONB fields:** Use `Json` type in Prisma. Validate JSONB structure in the service layer with Zod before writing.
- **Transactions:** Only inside services. Use `prisma.$transaction` for multi-step flows (payments, admissions, seat booking). Pass `tx` to repository methods.
- **Indexes:** Every FK gets an index. Partial indexes for hot status values. GIN indexes on queried JSONB columns.
- **UUIDs:** All primary keys are UUID.
- **Timestamps:** Every table has `created_at` and `updated_at`.

**12. Critical System Patterns:**

- **Concurrent Booking (Pessimistic Lock):**
  Hostel beds, bus seats, interview slots, event seats — use `prisma.$transaction` with atomic decrement. Check availability inside the transaction.

- **Payment Webhook Idempotency (Redis):**
  Key: `payment-processed:{razorpayPaymentId}` (24h TTL). Check before processing. Skip if exists.
  Flow: Verify signature → check idempotency → update transaction → trigger transfer → update ledger → generate receipt → send notification.

- **Referral Attribution:**
  Frontend stores referral code in localStorage + cookie (30-day). Sent with registration/login. Backend creates `referrals` row linking student to referrer. `applications.referral_code_id` set during application creation.

- **SSO (BeaconU → College Web):**
  Short-lived JWT (5 min) passed via redirect URL. College Web backend verifies, creates session.

- **Assessment Anti-Cheat:**
  Tab switch: 10-sec re-entry → terminate. Disconnect: 2-min grace → auto-submit. Configurable in `assessment_templates.settings` JSONB. Events logged in `assessment_attempts.anti_cheat_log` JSONB.

- **File Uploads:**
  S3 pre-signed URLs. Frontend uploads directly to S3. Backend stores URL in DB. Path: `/{collegeId}/{module}/{entityId}/{filename}`. 5MB limit (configurable).

- **Fee Calculation:**
  Application fee: lookup `application_fee_configs` by (admission_cycle + course + quota + nationality). Fallback to `admission_cycle_courses.application_fee`.

**13. Background Jobs (BullMQ):**
| Job | Frequency | Action |
|---|---|---|
| `offer-expiry` | Hourly | Expire offers past `valid_until`, move app status to `dropped_out` |
| `fee-overdue` | Daily midnight | Mark overdue `student_fee_ledger` entries, send notification |
| `assessment-auto-submit` | Every minute | Auto-submit attempts with stale heartbeat |
| `razorpay-transfer-retry` | Every 5 min | Retry failed fund transfers to college linked accounts |
| `session-reminder` | Continuous | Send counselling session reminder 1.5h before |
| `materialized-view-refresh` | Every 15 min | Refresh dashboard analytics views |
| `card-expiry` | Daily | Expire BeaconU cards past `valid_until` |

**14. API Design:**

- REST conventions. Plural nouns, no verbs in URL. Prefix: `/api/v1/`.
- College-scoped: `/api/v1/college/applications`
- Super Admin: `/api/v1/admin/universities`
- Blink: `/api/v1/blink/referrals`
- Student: `/api/v1/student/profile`
- Public: `/api/v1/public/colleges/:slug`
- Pagination: cursor-based for feeds/lists, offset for admin dashboards. Return `meta: { total, page, limit, hasNext }`.
- OpenAPI spec auto-generated from route definitions. Clients generate typed SDKs from spec.

**15. Status Flows (Reference):**

**Application:** `draft → submitted → under_review → eligibility_check → assessment_pending → assessment_completed → interview_pending → interview_completed → shortlisted → offer_issued → token_paid → enrolled | rejected | dropped_out | deferred`

**Assessment Attempt:** `not_started → in_progress → completed | auto_submitted | terminated → under_evaluation → evaluated → result_published`

**Transaction:** `pending → completed | failed | rejected | refunded`

**Document Request:** `submitted → processing → awaiting_approval → approved | rejected → issued → collected`

**Support Ticket:** `in_progress → awaiting_response → resolved → closed | reopened`

**16. Logging:**

- Structured JSON: `timestamp, level, requestId, userId, userType, collegeId, module, action, duration`.
- Log: payments, wallet changes, status transitions, auth events, errors, webhook events.
- DO NOT log: passwords, tokens, card numbers, raw Razorpay signatures, full JSONB blobs.

**17. Code Style:**

- `async/await` everywhere. `const` default. Explicit return types on all functions.
- `camelCase` variables/functions, `PascalCase` types/interfaces, `UPPER_SNAKE_CASE` constants, `snake_case` DB columns (Prisma maps automatically).
- Absolute imports: `@beaconu/db`, `@beaconu/types`, `@/shared/`, `@/modules/`.
- No circular imports. No barrel files. No default exports (except routes).

**18. Branching Strategy:**

```
main        → production
develop     → staging
feature/*   → work branches
```

- Branch per feature (not per app). Small PRs. Merge frequently.

**19. Team Ownership:**

- Backend → `apps/api`, `packages/db`
- Web → frontend apps (`apps/web`, `apps/college-web`, `apps/college-admin`)
- Flutter → separate repo
- Shared → API contracts (`packages/types`, `packages/validation`)

**20. Anti-Patterns (DO NOT BUILD):**

- Generic BaseRepository/BaseService classes with inheritance
- OOP inheritance trees for models or services
- Pub/sub event system inside the monolith (call services directly)
- Separate domain/entity layers (service IS the domain layer)
- CQRS or event sourcing
- Barrel files (`index.ts` re-exports)
- Direct Prisma calls from controllers
- Fat repositories with business logic or complex joins (use queries for reads)
- Scattered DB queries outside repositories and queries
- Premature microservices

**21. Pre-Code Checklist:**

1. Right module? 2. Controller thin (validate + one service/query call + response)? 3. Service has ALL business logic? 4. Repository has NO logic (writes + simple reads only)? 5. Query used for complex reads (no writes)? 6. Cross-module via Services only? 7. `$transaction` for multi-table writes? 8. Redis lock for concurrent resources? 9. College-scoped query has `collegeId` filter? 10. `AppError` thrown (not generic Error)? 11. Logged state changes? 12. DTO returned (not raw Prisma type)? 13. Zod validation on input? 14. OpenAPI spec updated?

**22. Mental Model:**

- **Service** = business logic
- **Repository** = safe writes
- **Query** = optimized reads
- **Controller** = thin glue (validate → delegate → respond)
