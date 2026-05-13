# BeaconU — CLAUDE.md (Root)

## Cross-cutting context. App rules are in apps/\*/CLAUDE.md.

---

## What This Is

Multi-tenant college admission platform. 4 web apps + 1 backend sharing 1 database.

- `apps/api` — Single Express backend serving all clients
- `apps/web` — BeaconU Student App (explore colleges, psychometric assessments, BeaconU Card)
- `apps/college-web` — Per-college student portal (apply, pay fees, hostel/commute, Student Hub)
- `apps/college-admin` — Per-college admin panel (applications, assessments, fees, staff)
- `apps/super-admin` — Platform Super Admin (onboard colleges, manage content, platform config)
- Flutter mobile app is a **separate repo**

## Monorepo

```
apps/api/           Express backend
apps/web/           Next.js (port 3000)
apps/college-web/   Next.js (port 3001)
apps/college-admin/ Next.js (port 3002)
apps/super-admin/   Next.js (port 3003)
packages/db/        Prisma schema + migrations + client (backend only)
packages/types/     Shared DTOs + enums (frontend + backend)
packages/validation/ Shared Zod schemas
packages/utils/     Pure utility functions
```

## Hard Rules

- Frontend apps NEVER import from `packages/db`
- `packages/types` is the ONLY cross-app source of DTO types
- All business logic lives in `apps/api` — frontends are thin consumers
- Flutter generates its SDK from the OpenAPI spec — never hand-write types there

## API URL Structure

```
/api/v1/admin/*         Platform Admin
/api/v1/college/*       College Admin / Staff
/api/v1/student/*       Students
/api/v1/blink/*         Blink (associate, ambassador)
/api/v1/counsellor/*    Counsellors
/api/v1/public/*        No auth
/api/v1/webhooks/*      Third-party webhooks
/api/v1/health          Health check
```

## 5 Identity Tables (not one users table)

| Table             | Who                                  | Auth                           |
| ----------------- | ------------------------------------ | ------------------------------ |
| `students`        | Students                             | Google OAuth + third-party OTP |
| `platform_admins` | Super Admins                         | Email + Password               |
| `staff_members`   | College staff (scoped to college_id) | Email + Password               |
| `blink_users`     | Associates + Ambassadors             | Email + Password               |
| `counsellors`     | Academic + MindCare                  | Email + Password               |

JWT: `{ userId, userType, collegeId?, roleId?, permissions[], sessionId }`

## Branching

`main` → production | `develop` → staging | `feature/*` → work
Branch per feature. Small PRs. Merge frequently.

## Bruno API Contracts (`packages/api-contracts/`)

Every API route change must be reflected in `packages/api-contracts/` in the same session.

**Script rules — every `.bru` file that returns useful IDs or tokens MUST include a `script:post-response` block:**

| Response data                      | Env var to set                                                          |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `data.accessToken`                 | `accessToken`                                                           |
| `data.user.id` (on register/login) | Entity-specific ID (e.g. `blogAuthorId`, `counsellorId`)                |
| `data.id` (created resource)       | Resource-specific ID (e.g. `blogId`, `universityId`, `collegeId`)       |
| `data[0].id` (first item in list)  | Same resource-specific ID — lets subsequent requests use it immediately |

**Pattern:**

```js
script:post-response {
  if (res.status === 200 || res.status === 201) {
    const data = res.getBody();
    if (data.data && data.data.accessToken) {
      bru.setEnvVar("accessToken", data.data.accessToken);
    }
    if (data.data && data.data.id) {
      bru.setEnvVar("resourceId", data.data.id);
    }
  }
}
```

**Environment variables** — All IDs captured by scripts must be declared in `environments/local.bru` and `environments/render.bru` (empty string is fine). Never hard-code IDs inside `.bru` files using `vars:pre-request` when the ID is meant to flow from a previous request.

## Docs

- `docs/system-context.md` — business flows, decisions, locked rules
- `docs/db-schema-reference.md` — all 110 tables, columns, indexes (token-optimized)
