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
/api/v1/college-admin/*       College Admin / Staff
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

# BeaconU Frontend — CLAUDE.md

## Applies to apps/web, apps/college-web, apps/college-admin, apps/super-admin.

---

## Stack

Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS, shadcn/ui (Radix primitives),
Zustand (auth only), TanStack Query v5, React Hook Form, Zod v4, Sonner, Lucide React.
Turborepo + pnpm.

---

## App Structure

```
app/
  (auth)/                    Unauthenticated layout (login, register)
  (dashboard)/
    layout.tsx               Sidebar + header shell
    page.tsx                 Default dashboard (async Server Component)
    [section]/
      page.tsx               Async Server Component
      loading.tsx            Suspense skeleton — mirrors real layout exactly
      error.tsx              Error boundary — 'use client'
  layout.tsx                 Root layout (fonts, providers, globals)
  providers.tsx              QueryClientProvider + Toaster — 'use client'
  global-error.tsx           Fatal crash — renders own <html><body>, no app imports
  not-found.tsx
  globals.css
components/
  ui/                        shadcn/ui — DO NOT modify internals
  layout/                    Sidebar, Header, Shell — no business logic
  [feature]/                 Feature components colocated with their page
  error-boundary.tsx         Reusable React class ErrorBoundary
hooks/
  use-[domain].ts            One file per domain — useQuery + useMutation hooks only
lib/
  api.ts                     Typed fetch client + ApiError + getErrorMessage()
  cookies.ts                 Cookie read/write (for middleware compat)
  query-keys.ts              All TanStack Query cache keys — single source of truth
  rbac.ts                    Permission map + can() / canAny()
  services/                  One file per domain: colleges.service.ts etc.
store/
  auth.store.ts              Zustand auth (persisted) — only global auth state
  index.ts                   Re-exports only
middleware.ts                Auth guard + redirects — ONLY place for auth redirects
```

---

## Server vs Client Components

- Default: **Server Component**
- Add `'use client'` only for: hooks, browser APIs, event handlers, Zustand access
- Never `'use client'` on layout files
- Initial page data: `async/await` in RSC — never `useEffect` for initial loads

---

## Providers Setup

`app/providers.tsx` is the single place where client-side providers are mounted.
It wraps QueryClientProvider, Toaster, and any future providers.

```tsx
// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

Mount it in `app/layout.tsx` wrapping `{children}`. Never mount it anywhere else.

---

## Data Fetching

### Rule: one fetch location per page — RSC or client hook, never both.

**Server Components (RSC) — page.tsx:**

Use RSC for initial page data. It runs on the server, has zero client JS cost,
and errors are caught automatically by `error.tsx`.

```tsx
// Parallel fetches — never sequential awaits
export default async function Page() {
  const [colleges, stats] = await Promise.all([getColleges(1), getStats()]);
  return <CollegesTable initialData={colleges} stats={stats} />;
}
```

- Real-time data: `fetch(..., { cache: 'no-store' })`
- Stale-ok data: `fetch(..., { next: { revalidate: N } })`
- One optional failing fetch: wrap in `try/catch`, pass `null` as prop, render inline empty state

**Client Components — TanStack Query:**

Use TanStack Query for all client-side data fetching. Never use raw `useEffect` for fetching.

```tsx
// hooks/use-colleges.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColleges, createCollege } from "@/lib/services/colleges.service";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useColleges(page: number) {
  return useQuery({
    queryKey: QUERY_KEYS.colleges(page),
    queryFn: () => getColleges(page),
  });
}

export function useCreateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.colleges() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
```

**In the component:**

```tsx
// READ
const { data, isLoading, error } = useColleges(1);

// WRITE — toast.success lives in the component, not the hook
const { mutate, isPending } = useCreateCollege();

function handleSubmit(data: CreateCollegeInput) {
  mutate(data, {
    onSuccess: () => {
      toast.success("College created");
      router.push("/colleges");
    },
  });
}
```

**Why toast.success in the component, not the hook:**
The hook doesn't know the context. "College created" vs "University archived" are component
concerns. Only `toast.error` belongs in the hook because error handling is always the same.

---

## Query Keys

All cache keys live in `lib/query-keys.ts`. Never inline a query key string in a hook or component.

```ts
// lib/query-keys.ts
export const QUERY_KEYS = {
  colleges: (page?: number) =>
    page !== undefined ? ["colleges", page] : ["colleges"],
  college: (id: string) => ["colleges", id],
  universities: ["universities"] as const,
  university: (id: string) => ["universities", id],
  universityTypes: ["university-types"] as const,
  // ...one entry per domain
} as const;
```

---

## Service Functions

Services are pure async functions that call `api.*`. They have no React dependency.
Components never call `api.*` directly — always through a service, always through a hook.

```ts
// lib/services/colleges.service.ts
import { api } from "@/lib/api";
import type { College, PaginatedResponse } from "@beaconu/types";

export async function getColleges(
  page: number,
): Promise<PaginatedResponse<College>> {
  return api.get(`/api/v1/admin/colleges?page=${page}`);
}

export async function createCollege(
  data: CreateCollegeInput,
): Promise<College> {
  return api.post("/api/v1/admin/colleges", data);
}
```

- One file per domain
- Explicit return type from `@beaconu/types` — never redefine DTOs in the frontend
- No toast calls, no router calls, no React imports

---

## API Client (`lib/api.ts`)

The api client handles auth headers, response unwrapping, and session expiry.

```ts
// The 401 redirect uses a custom event — never window.location.href directly.
// This keeps the redirect in the React tree (providers.tsx listens for it)
// and avoids crashing in SSR contexts where window is undefined.
if (res.status === 401) {
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
  }
  throw new ApiError(401, "Session expired. Please sign in again.");
}
```

Mount the listener once in `app/providers.tsx`:

```tsx
useEffect(() => {
  const handler = () => router.push("/login?reason=expired");
  window.addEventListener("auth:session-expired", handler);
  return () => window.removeEventListener("auth:session-expired", handler);
}, [router]);
```

**`getErrorMessage` — required export in `lib/api.ts`:**

```ts
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again.";
  switch (error.status) {
    case 403:
      return "You don't have permission to do this";
    case 404:
      return "Resource not found";
    case 409:
    case 422:
      return error.message; // use backend's validation message
    default:
      return "Something went wrong. Please try again.";
  }
}
```

Use `getErrorMessage` in every `onError` callback. Never manually check `err.status` in components.

---

## Forms

Use React Hook Form + Zod for all forms. Never manage form state manually with `useState`.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema above the component
const createCollegeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  university_type_id: z.string().uuid("Select a university type"),
});
type CreateCollegeInput = z.infer<typeof createCollegeSchema>;

// 2. Wire up inside the component
export function CreateCollegeForm() {
  const { mutate, isPending } = useCreateCollege();
  const form = useForm<CreateCollegeInput>({
    resolver: zodResolver(createCollegeSchema),
    defaultValues: { name: "", slug: "", university_type_id: "" },
  });

  function onSubmit(data: CreateCollegeInput) {
    // data is already type-safe and validated — pass directly to mutate
    mutate(data, {
      onSuccess: () => {
        toast.success("College created");
        router.push("/colleges");
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <input {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner className="mr-2 h-4 w-4" />} Create College
      </Button>
    </form>
  );
}
```

**Rules:**

- Zod schema defined at module level, above the component
- `z.infer<typeof schema>` for the form type — never duplicate type definitions
- Field-level errors rendered inline below each field
- `isPending` from `useMutation` — never manual `useState` for loading on form submit
- `toast.success` in the component's `onSuccess` callback
- `toast.error` via `getErrorMessage` in the hook's `onError` — never manually in the component

---

## Toast Rules

| Situation               | Where                          | Pattern                                    |
| ----------------------- | ------------------------------ | ------------------------------------------ |
| Mutation success        | Component `onSuccess` callback | `toast.success('Action done')`             |
| Mutation error          | Hook `onError`                 | `toast.error(getErrorMessage(error))`      |
| Read/query error        | Inline empty/error state in UI | No toast — use `error.tsx` or inline state |
| Form validation failure | Inline under field             | No toast — show field error                |

**Never:**

- Toast inside service functions
- Toast inside `lib/api.ts` (except `getErrorMessage` utility)
- Multiple toasts for one action
- Toast for read failures — use the UI state from `useQuery`'s `error` field

---

## State Management

### Zustand — auth only

Zustand stores only global auth session state. Never put API response data in Zustand.

```ts
// store/auth.store.ts — correct
interface AuthState {
  admin: Admin | null;
  token: string | null;
  setAuth: (admin: Admin, token: string) => void;
  clearAuth: () => void;
}
```

`isAuthenticated` is a derived value — compute it from `token`, never store it separately:

```ts
// In a component or hook:
const isAuthenticated = useAuthStore((s) => s.token !== null);
// NOT: useAuthStore(s => s.isAuthenticated) ← fragile derived state stored as state
```

Always use granular selectors — never destructure the whole store:

```ts
// Bad — re-renders on any store change
const { admin, token } = useAuthStore();

// Good — re-renders only when admin changes
const admin = useAuthStore((s) => s.admin);
const token = useAuthStore((s) => s.token);
```

Zustand `persist` rehydration re-syncs the auth cookie in `onRehydrateStorage`.
Import from `@/store`, never from the store file directly.

### What goes where

| Data type                                       | Where                |
| ----------------------------------------------- | -------------------- |
| Auth session (token, user)                      | Zustand              |
| API response data                               | TanStack Query cache |
| UI-only local state (modal open, tab selection) | `useState`           |
| Cross-page filter that must survive navigation  | Zustand              |
| Form state                                      | React Hook Form      |

---

## Loading States

| Context            | Tool                                                          |
| ------------------ | ------------------------------------------------------------- |
| Route navigation   | `loading.tsx` + Skeleton                                      |
| Client query fetch | `isLoading` from `useQuery` + Skeleton                        |
| Mutation (write)   | `isPending` from `useMutation` + disabled Button with Spinner |

**`loading.tsx` rules:**

- Mirror real layout exactly: same grid, same column count, same card structure
- Skeleton row count = default API page size for that route
- Spinners only on buttons — never in content areas
- Never a blank white div while loading

**Mutation pending state — standard pattern:**

```tsx
const { mutate, isPending } = useUpdateCollege();

<Button onClick={() => mutate(data)} disabled={isPending}>
  {isPending && <Spinner className="mr-2 h-4 w-4" />}
  Save Changes
</Button>;
```

---

## Error Handling

**`error.tsx` (route segment — most common):**

```tsx
"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div>
      <p>{error.message ?? "An unexpected error occurred."}</p>
      {error.digest && <p className="font-mono text-xs">ID: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
      <Button asChild>
        <Link href="/">Dashboard</Link>
      </Button>
    </div>
  );
}
```

- `'use client'`, log in `useEffect`, show `error.digest`, two escapes: reset + home
- Every route segment must have an `error.tsx`

**`global-error.tsx` (fatal — root layout crash):**

- Renders its own `<html><body>` — no shadcn, no app imports, no CSS variables
- Inline styles only
- Must exist at `app/global-error.tsx`

**`<ErrorBoundary>` (widget-level):**

- `components/error-boundary.tsx` — React class component
- Wrap independent sections that can fail without blanking the whole page
- `componentDidCatch` must log error + component stack

**Inline query errors (client components):**

```tsx
const { data, isLoading, error } = useColleges(1);
if (isLoading) return <TableSkeleton rows={10} />;
if (error) return <InlineError message={getErrorMessage(error)} />;
```

**Never:**

- Show raw error objects to users
- Swallow errors silently — every `catch` must set error state or `console.error`
- Use `toast` for read failures — use inline error UI

---

## RBAC

```tsx
const { can } = useRbac();
if (can('colleges.manage')) { ... }

<RoleGuard permission="colleges.manage" fallback={<DisabledButton />}>
  <DeleteButton />
</RoleGuard>
```

- Permission format: `resource.action`
- Never hard-code role checks in components — `lib/rbac.ts` owns the permission map
- `useRbac()` reads role from auth store via granular selector

---

## Auth & Sessions

- JWT stored in `localStorage` via Zustand `persist` + cookie (for middleware)
- Middleware reads cookie server-side. Zustand reads localStorage client-side.
- `isAuthenticated` derived from `token !== null` — never a manually managed boolean
- Login: `setAuth(user, token)` → sets Zustand + cookie. Logout: `clearAuth()` → clears both.
- `middleware.ts` is the ONLY place for auth redirects
- Session expiry redirect triggered via `auth:session-expired` CustomEvent from `api.ts`,
  handled in `providers.tsx` — never `window.location.href = '/login'`

---

## College Scoping (college-web + college-admin)

Every mutating API call includes `college_id` from auth store.
Missing `college_id` → redirect to login (handled in middleware).

---

## Styling

- Tailwind utilities only. `cn()` for conditional classes — never string concatenation.
- Design tokens as CSS variables in `globals.css` → `tailwind.config.ts`. Never hardcode hex.
- Mobile-first (`sm:` `md:` `lg:`). Sidebar breakpoint: `lg:`. Dark mode: class-based.

---

## Performance

- Prefer Server Components for data-heavy pages — zero JS bundle cost
- `next/image` for all images. `next/link` for all internal links.
- `next/dynamic` for heavy Client Components (modals, charts, editors)
- TanStack Query handles deduplication and caching — no manual `React.cache()` needed
  for client components; use `React.cache()` only for RSC service functions called in
  multiple layout/page components in the same render pass

---

## Naming

- Next.js files: lowercase (`page.tsx` `layout.tsx` `loading.tsx` `error.tsx` `providers.tsx`)
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Services: `kebab-case.service.ts`
- Stores: `kebab-case.store.ts`
- No default exports except Next.js reserved files

---

## TypeScript

- `strict: true`. No `any`, no `@ts-ignore`, no `as X` without a comment explaining why.
- Types from `@beaconu/types` — never redefine DTOs in the frontend.
- Absolute imports: `@/components/` `@/lib/` `@/store/` `@/hooks/` `@beaconu/types`

---

## Mock Data (dev only)

Gate behind `NEXT_PUBLIC_MOCK_AUTH=true` or missing `NEXT_PUBLIC_API_URL`.
Mock data lives inside the service file. Remove before merging to `develop`.
Never commit as default.

---

## Anti-Patterns

| Don't                                                | Do instead                                               |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `useEffect` for data fetching                        | `useQuery` hook                                          |
| Manual `useState` for loading/error/data             | `useQuery` / `useMutation`                               |
| `apiAction()` or `toast.loading` wrappers            | `useMutation` with `onSuccess`/`onError`                 |
| `toast.success` inside a hook                        | `toast.success` in the component `onSuccess`             |
| `toast.error` manually in a component                | `toast.error(getErrorMessage(error))` in `onError`       |
| `window.location.href = '/login'`                    | `auth:session-expired` event + router in `providers.tsx` |
| `isAuthenticated` as stored boolean                  | `token !== null` computed in selector                    |
| `const { admin } = useAuthStore()`                   | `const admin = useAuthStore(s => s.admin)`               |
| API response data in Zustand                         | TanStack Query cache                                     |
| Inline query key strings                             | `QUERY_KEYS.*` from `lib/query-keys.ts`                  |
| Manual form state with `useState`                    | React Hook Form + Zod                                    |
| `err.status` checks in components                    | `getErrorMessage(error)`                                 |
| Raw `fetch()` in components                          | service function → hook                                  |
| Types defined locally that exist in `@beaconu/types` | Import from `@beaconu/types`                             |
| Barrel `index.ts` files in features                  | Direct imports                                           |
| Default exports on non-Next.js files                 | Named exports                                            |
| Multiple Zustand stores for same domain              | Single store per domain                                  |
| `localStorage` in Server Components                  | Middleware cookie / Zustand (client only)                |

---

## New Feature Checklist

1. **Server or Client?** Default Server. Add `'use client'` only if hooks/events/browser APIs needed.
2. **Data fetching?** RSC → `async/await` in page.tsx. Client → `useQuery` hook.
3. **Mutation?** `useMutation` hook. `toast.error(getErrorMessage)` in `onError`. `toast.success` in component.
4. **Form?** Zod schema + `useForm({ resolver: zodResolver(schema) })`. Field errors inline.
5. **Query key?** Add to `QUERY_KEYS` in `lib/query-keys.ts`. Never inline.
6. **New route?** Add `loading.tsx` (mirrors real layout) + `error.tsx`.
7. **Permission-gated?** `<RoleGuard>` or `useRbac()`.
8. **Type?** From `@beaconu/types`. Never redeclare locally if it exists there.
9. **Conditional class?** `cn()`. Never string concatenation.
10. **Image?** `next/image`. **Link?** `next/link`.
11. **Heavy component?** `next/dynamic`.
12. **College-scoped mutation?** Include `college_id` from auth store.
13. **Zustand selector?** Granular `s => s.field`, never full destructure.
