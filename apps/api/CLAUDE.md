# BeaconU API — CLAUDE.md

## Backend rules. Also read root CLAUDE.md.

---

## Module Structure

`src/modules/<domain>/` — flat, no sub-folders inside a module.

```
controllers/  One file per actor
services/     Business logic — split by entity, shared across controllers
repositories/ Prisma writes + simple reads
queries/      Complex reads: joins, aggregations, UI-ready DTOs
validators/   Zod schemas only
routes/       One file per actor
```

**Controller + route file naming (by actor):**
`platform-admin` | `college-admin` | `student` | `associate-admin` | `associate-employee` | `ambassador` | `counsellor` | `public` | `webhook`

**Service split: by entity, not by caller.**

```
universities/services/universities.service.ts       ← owns university CRUD
universities/services/university-types.service.ts   ← owns type CRUD
universities/controllers/platform-admin.controller.ts ← calls both services above
```

A controller calls multiple services from its own module. Services never split by who calls them.

## Route Mounting (Two-Level)

`src/routes/index.ts` → group indexes → module routes. Nothing else mounts routes.

```
src/routes/index.ts          router.use("/api/v1/admin", adminRoutes) etc.
src/routes/admin/index.ts    router.use("/universities", adminUniversityRoutes)
src/routes/college/index.ts  router.use("/applications", collegeAdmissionsRoutes)
src/routes/student/index.ts  ...
src/routes/blink/index.ts    ...
src/routes/counsellor/index.ts
src/routes/public/index.ts
src/routes/webhooks/index.ts
```

## Data Access (CRITICAL)

**Write:** `Controller → Service → Repository → DB`
**Read:** `Controller → Query → DB`

- Repository: writes + simple reads, no complex joins, accepts `tx` param
- Query: joins, aggregations, UI-ready DTOs, no writes, no business logic

## Layer Rules (STRICT)

**Controller:** validate (Zod `.parse()`) → call ONE service OR ONE query → respond. No logic, no DB, no try/catch.
**Service:** All business logic. Calls own repo. Calls other modules' services (never their repos). Throws `AppError`. Maps to DTOs. No Prisma directly. No `req`/`res`.
**Repository:** Prisma only. No logic. Returns Prisma types to OWN service only.
**Query:** Complex Prisma reads. Returns DTOs directly to controller.
**Validator:** Zod schemas. No DB calls.

## Authorization

```ts
authenticate; // validates JWT → req.userId/userType/permissions/collegeId
authorizeUserType("platform_admin"); // checks req.userType
authorize("universities.manage"); // checks req.permissions includes code OR '*'

// Standard route pattern:
router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.manage"),
  ctrl,
);
```

- Auth middleware in route files only — never inside controllers
- No custom per-feature auth middleware — use `authorize(code)`
- `'*'` permission = Super Admin wildcard, bypasses all permission checks

**Route auth patterns:**

- `college-admin.routes.ts` → `authenticate` + `authorize(permission)`
- `student.routes.ts` → `authenticate` only
- `public.routes.ts` / `webhook.routes.ts` → no auth (webhooks use HMAC inside controller)

## Module Interaction

Modules talk via Services only. Never import another module's Repository, Query, or Prisma model. Cross-module data = plain DTOs from `packages/types`.

## College Scoping

Every college-scoped query: `WHERE college_id = ...`. No exceptions. Staff session carries `collegeId`. Super Admin bypasses.

## DB Rules

- All changes via Prisma Migrate. Never raw ALTER TABLE.
- **Soft deletes only. Never `prisma.<model>.delete()`.** Use `status` (active/inactive/archived) or `isActive = false`. Repository method name: `softDeleteById`, not `deleteById`.
- JSONB: `Json` type in Prisma. Validate structure in service with Zod before writing.
- Transactions: `prisma.$transaction` inside services only. Pass `tx` to repos.
- All PKs: UUID. All tables: `created_at` + `updated_at`.

## Error & Response

```ts
{ success: true, data: {...}, meta?: { total, page, limit, hasNext } }
{ success: false, error: { code: "RESOURCE_NOT_FOUND", message: "..." } }
```

Throw: `NotFoundError` `ConflictError` `ForbiddenError` `ValidationError` `UnauthorizedError`
Central `errorHandler` formats all responses. No try/catch in controllers.

## Critical Patterns

**Concurrent booking:** `prisma.$transaction` + atomic decrement. Check availability inside tx.
**Webhook idempotency:** Redis `payment-processed:{paymentId}` 24h TTL. Check before processing. Flow: verify sig → idempotency check → update txn → transfer → update ledger → receipt → notify.
**File uploads:** S3 pre-signed URLs. Path: `/{collegeId}/{module}/{entityId}/{filename}`. 5MB (configurable).
**Fee calc:** Lookup `application_fee_configs` (cycle + course + quota + nationality) → fallback to `admission_cycle_courses.application_fee`.
**Referral:** localStorage + cookie 30-day. Set on registration. `applications.referral_code_id` on apply.
**SSO (BeaconU → College Web):** Short-lived JWT (5 min) via redirect URL.

## Background Jobs (BullMQ)

`offer-expiry` hourly | `fee-overdue` daily midnight | `assessment-auto-submit` every min | `razorpay-transfer-retry` every 5min | `session-reminder` 1.5h before | `materialized-view-refresh` every 15min | `card-expiry` daily

## Status Flows

**Application:** `draft→submitted→under_review→eligibility_check→assessment_pending→assessment_completed→interview_pending→interview_completed→shortlisted→offer_issued→token_paid→enrolled|rejected|dropped_out|deferred`
**Assessment:** `not_started→in_progress→completed|auto_submitted|terminated→under_evaluation→evaluated→result_published`
**Transaction:** `pending→completed|failed|rejected|refunded`
**Enrollment:** `active|on_leave|suspended|completed|withdrawn|course_switched`
**Document:** `submitted→processing→awaiting_approval→approved|rejected→issued→collected`
**Ticket:** `in_progress→awaiting_response→resolved→closed|reopened`

## Module Inventory

| Module                                                    | Controllers                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| `auth`                                                    | student, staff, blink, counsellor, platform-admin               |
| `universities`                                            | platform-admin, public                                          |
| `colleges`                                                | platform-admin, college-admin, public                           |
| `platform-admin`                                          | platform-admin (roles + user mgmt only)                         |
| `admissions`                                              | college-admin, student                                          |
| `assessments`                                             | college-admin, student                                          |
| `interviews`                                              | college-admin, student                                          |
| `payments`                                                | college-admin, student, webhook                                 |
| `documents`                                               | college-admin, student                                          |
| `hostel`                                                  | college-admin, student, public                                  |
| `commute`                                                 | college-admin, student                                          |
| `counselling`                                             | counsellor, student, platform-admin                             |
| `blink`                                                   | associate-admin, associate-employee, ambassador, platform-admin |
| `content`                                                 | platform-admin, public                                          |
| `events`                                                  | platform-admin, college-admin, student, public                  |
| `community` `engagement` `notifications` `support` `chat` | student / college-admin                                         |
| `staff` `scholarships`                                    | college-admin                                                   |
| `health`                                                  | —                                                               |

## Shared (`src/shared/`)

`config/env.ts` | `constants/` | `errors/` (AppError subclasses) | `lib/` (logger, redis, queue, s3) | `middleware/` (authenticate, authorize, authorizeUserType, error-handler, validate, request-id) | `responses/` (api-response, pagination) | `types/express.d.ts` | `utils/`

## Code Style

- `async/await`, `const`, explicit return types on exported functions
- Files: `kebab-case.ts` | Classes/types: `PascalCase` | Vars: `camelCase` | Constants: `UPPER_SNAKE_CASE`
- Absolute imports: `@beaconu/db` `@beaconu/types` `@/shared/` `@/modules/`
- No circular imports. No barrel files. No default exports (except route files).

## Logging

Structured JSON: `timestamp, level, requestId, userId, userType, collegeId, module, action, duration`
Log: payments, wallet changes, status transitions, auth events, errors, webhooks.
Never log: passwords, tokens, card numbers, raw Razorpay signatures, full JSONB blobs.

## Anti-Patterns

No: BaseRepository/Service inheritance · OOP trees · pub/sub inside monolith · CQRS · barrel files · Prisma in controllers · services split by caller · routes inside module files · module routes imported directly into routes/index.ts

## Checklist

1. Right module? 2. Controller thin (validate + one call + respond)? 3. Service has ALL logic? 4. Repo = writes + simple reads only? 5. Query for complex reads, no writes? 6. Cross-module via Services? 7. `$transaction` for multi-table writes? 8. Redis lock for concurrent? 9. College-scoped filter present? 10. AppError thrown? 11. State changes logged? 12. DTOs across boundaries (not raw Prisma)? 13. Zod validation on inputs? 14. OpenAPI spec updated?
