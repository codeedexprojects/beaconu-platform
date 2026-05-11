# Backend Architecture Rules — BeaconU API

## Module Structure (Domain-first, app-specific controllers)

Every feature lives in `src/modules/<domain>/`. Each module has exactly these subdirectories:

```
src/modules/<domain>/
├── controllers/       # One file per app context (see naming below)
├── services/          # Business logic — shared across controllers
├── repositories/      # All DB access (Drizzle queries live here)
├── queries/           # Reusable Drizzle query builders / fragments
├── validators/        # Zod schemas for request validation
└── routes/            # One route file per app context
```

### Controller naming convention

Name by the **actor**, not the domain:

| Actor | File name |
|---|---|
| Super / Platform Admin | `platform-admin.controller.ts` |
| College Admin / Staff | `college-admin.controller.ts` |
| Student | `student.controller.ts` |
| Blink Associate Admin | `associate-admin.controller.ts` |
| Blink Associate Employee | `associate-employee.controller.ts` |
| Campus Ambassador | `ambassador.controller.ts` |
| Counsellor | `counsellor.controller.ts` |
| Public (no auth) | `public.controller.ts` |
| Webhook (no auth) | `webhook.controller.ts` |

### Route file naming convention

Mirrors the controller name:

```
routes/platform-admin.routes.ts   →  /api/v1/admin/<domain>/*
routes/college-admin.routes.ts    →  /api/v1/college/<domain>/*
routes/student.routes.ts          →  /api/v1/student/<domain>/*
routes/associate.routes.ts        →  /api/v1/blink/associate/*
routes/ambassador.routes.ts       →  /api/v1/blink/ambassador/*
routes/public.routes.ts           →  /api/v1/public/<domain>/*
```

## Route Mounting

`src/routes/index.ts` is the **single entry point** — it imports every module's route files and mounts them. No route mounting happens anywhere else (not in `app.ts`, not inside modules).

URL prefix structure:

```
/api/v1/admin/*           Platform Admin
/api/v1/college/*         College Admin / Staff
/api/v1/student/*         Students
/api/v1/blink/associate/* Blink Associate (admin + employee)
/api/v1/blink/ambassador/*Campus Ambassadors
/api/v1/counsellor/*      Counsellors
/api/v1/public/*          No auth required
/api/v1/webhooks/*        Third-party webhooks (no auth)
/api/v1/health            Health check
```

## Auth in Route Files

- `college-admin.routes.ts` — always uses `authenticate` + `authorize(permissions)`
- `student.routes.ts` — always uses `authenticate`
- `public.routes.ts` — no auth middleware
- `webhook.routes.ts` — no auth middleware (use HMAC verification inside controller)

Never import auth middleware inside a controller. It belongs in the route file.

## Layer Responsibilities

**Controller** — HTTP boundary only. Parse request, call service, return response. No DB access, no business logic.

**Service** — Business logic. Calls repositories. Never imports Express types (`Request`, `Response`). Returns plain objects or throws `AppError` subclasses.

**Repository** — All Drizzle queries. Never contains conditional business logic. Returns raw DB rows or throws on DB error.

**Query** — Reusable Drizzle fragments (joins, where clauses, select shapes) shared across repositories. Optional — only create when two or more repositories share the same fragment.

**Validator** — Zod schemas only. Export one schema per operation (e.g., `createUniversitySchema`, `updateUniversitySchema`). Used via the `validate` middleware.

## Module Inventory

| Module | Actors |
|---|---|
| `auth` | student, staff, blink, counsellor, platform-admin |
| `universities` | platform-admin, public |
| `colleges` | platform-admin, college-admin, public |
| `admissions` | college-admin, student |
| `assessments` | college-admin, student |
| `interviews` | college-admin, student |
| `payments` | college-admin, student, webhook |
| `documents` | college-admin, student |
| `hostel` | college-admin, student, public |
| `commute` | college-admin, student |
| `counselling` | counsellor, student |
| `blink` | associate-admin, associate-employee, ambassador, platform-admin |
| `content` | platform-admin, public |
| `events` | platform-admin, college-admin, student, public |
| `community` | student |
| `engagement` | student |
| `notifications` | college-admin, student |
| `support` | college-admin, student |
| `chat` | blink (ambassador), student |
| `staff` | college-admin |
| `scholarships` | college-admin, student |
| `health` | — |

## Shared Code (`src/shared/`)

```
shared/
├── config/       env.ts — typed env vars via zod
├── constants/    app-wide constants
├── errors/       AppError + subclasses (BadRequest, NotFound, Conflict, …)
├── lib/          logger, redis, queue, s3 — infrastructure singletons
├── middleware/   authenticate, authorize, error-handler, validate, request-id
├── responses/    api-response, error-codes, pagination helpers
├── types/        express.d.ts augmentation
└── utils/        pure utility functions
```

Never add domain logic to `shared/`. If something is only used by one module, it belongs in that module.

## Naming Rules

- Files: `kebab-case.ts`
- Classes / types / interfaces: `PascalCase`
- Functions / variables: `camelCase`
- Zod schemas: `camelCaseSchema` (e.g., `createCollegeSchema`)
- DB column names: `snake_case` (Drizzle convention)

## Do Not

- Do not add business logic in controllers
- Do not access the DB from controllers or route files
- Do not define routes inside module files — all routes mount in `src/routes/index.ts`
- Do not put shared utilities inside a module directory
- Do not create a new top-level directory under `src/` — everything is a module or lives in `shared/`
- Do not duplicate service logic across controllers — write it once in the service, call it from multiple controllers
