# BeaconU — Frontend Rules & System Context (v1.0)

**1. Project Identity:** Multi-tenant college admission platform. 3 Next.js web apps in the monorepo, all thin API consumers. Backend is the single source of truth for all business logic — frontends do not implement business rules.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix UI primitives), Zustand, Zod, Sonner (toasts), Lucide React. Monorepo: Turborepo + pnpm workspaces.

**2. Monorepo App Structure:**

```
apps/
  web/            # BeaconU Launchpad + Student App (port 3000)
  college-web/    # College Web Portal for students (port 3001)
  college-admin/  # College Admin Panel (port 3002)
  super-admin/    # Platform Super Admin Panel (port 3003)
packages/
  types/          # Shared DTOs, enums, constants — only cross-app package frontends use
  utils/          # Pure utility functions
  validation/     # Shared Zod schemas
```

- Frontend apps NEVER import from `packages/db` or any backend-only package.
- `packages/types` is the ONLY shared source of DTO types between frontend and backend.
- Frontend apps call the API via a typed `api` client — never raw `fetch` scattered through components.

**3. Next.js App Router Structure (per app):**

```
app/
  (auth)/               # Route group — unauthenticated layout
    login/
      page.tsx
  (dashboard)/          # Route group — authenticated layout
    layout.tsx          # Wraps dashboard with sidebar + header
    page.tsx            # Default dashboard
    [section]/
      page.tsx
      loading.tsx       # Suspense fallback
      error.tsx         # Error boundary
  layout.tsx            # Root layout (fonts, providers, globals)
  global-error.tsx      # Root error boundary
  not-found.tsx         # 404
  globals.css
components/
  ui/                   # shadcn/ui primitives — DO NOT modify internals
  layout/               # Sidebar, header, shell components
  [feature]/            # Feature-specific components
hooks/                  # Custom React hooks
lib/
  api.ts                # Single typed fetch client
  constants.ts          # App-wide constants
  utils.ts              # cn() and small utilities
  cookies.ts            # Cookie read/write helpers
  rbac.ts               # Permission map + can() / canAny() functions
  services/             # One file per domain (auth.service.ts, colleges.service.ts, …)
store/
  auth.store.ts         # Zustand auth store
  index.ts              # Re-exports only
middleware.ts           # Auth guard + redirects
```

**4. Routing & Layouts (CRITICAL):**

- Use **route groups** `(auth)` and `(dashboard)` to share layouts without adding URL segments.
- Every dashboard route gets its own `loading.tsx` (Suspense) and `error.tsx` (Error Boundary).
- `middleware.ts` is the ONLY place for auth-based redirects. Never redirect inside page components.
- **Middleware rule:** Public paths explicitly listed → authenticated user on public path → redirect to `/` → unauthenticated user on protected path → redirect to `/login?from=<pathname>`.
- `not-found.tsx` and `global-error.tsx` must exist at the root `app/` level.

**5. Server vs Client Components:**

- Default to **Server Components**. Mark `'use client'` only when the component needs:
  - `useState`, `useEffect`, `useRef`, or any React hook
  - Browser APIs (`window`, `localStorage`, `document`)
  - Event handlers attached to DOM elements
  - Zustand store access
- Do NOT put `'use client'` on layout files unless absolutely required — it forces the whole subtree client-side.
- Data fetching in Server Components: use `async/await` directly. No `useEffect` for initial data loads in RSCs.
- Client Components that need data: receive it as props from the Server Component parent, OR fetch via service functions inside a `useEffect` / event handler.

**6. Data Fetching Pattern:**

**The two flows — pick one, never mix:**

```
── Server fetch (RSC page.tsx) ──────────────────────────────────────────────
page.tsx (async Server Component)
  → await service function  (server-side, no auth store needed — read token from cookie/header)
  → pass typed data as props to Client Components

── Client fetch (interactive Client Component) ──────────────────────────────
'use client' component
  → call service function inside useEffect (reads only) or event handler (writes)
  → manage local { data, isLoading, error } state
  → render skeleton / error / content based on that state
```

**Rule: one fetch location per page.** Do not fetch the same resource in both the RSC and a child client component. Decide which layer owns the data and commit to it.

**Service functions (`lib/services/*.service.ts`):**

- One file per domain. Wrap every API endpoint in a named, typed function. Components never call `api.*` directly.
- Every service function has an explicit return type matching the DTO from `@beaconu/types`.

```ts
// lib/services/colleges.service.ts
import { api } from "@/lib/api";
import type { College, PaginatedResponse } from "@beaconu/types";

export async function getColleges(
  page: number,
): Promise<PaginatedResponse<College>> {
  return api.get(`/api/v1/admin/colleges?page=${page}`);
}

export async function createCollege(data: CreateCollegeDto): Promise<College> {
  return api.post("/api/v1/admin/colleges", data);
}
```

**Server Component fetch (page.tsx):**

```tsx
// app/(dashboard)/colleges/page.tsx
import { getColleges } from "@/lib/services/colleges.service";
import { CollegesTable } from "@/components/colleges/CollegesTable";

export default async function CollegesPage() {
  const colleges = await getColleges(1); // throws → caught by error.tsx
  return <CollegesTable initialData={colleges} />;
}
```

- `async/await` directly — no `useEffect`, no state, no hooks.
- Errors propagate to the nearest `error.tsx` automatically — no try/catch in the page.
- Use `cache: 'no-store'` inside the service function for real-time data. Use `next: { revalidate: 60 }` for data that can be stale by N seconds.

**Client fetch (reads in a Client Component):**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getColleges } from "@/lib/services/colleges.service";
import type { College, PaginatedResponse } from "@beaconu/types";

export function CollegesTable() {
  const [data, setData] = useState<PaginatedResponse<College> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getColleges(1)
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <TableSkeleton rows={5} />;
  if (error) return <InlineError message={error} />;
  if (!data) return null;
  return <Table data={data.items} />;
}
```

**Write operations — always use `apiAction()`:**

```tsx
const result = await apiAction(
  () => createCollege(formData),
  "College created successfully",
);
if (!result) return; // apiAction returned null → error was already toasted
router.push("/colleges");
```

- `apiAction()` handles the loading toast, success toast, and error toast. Never manually call `toast.loading` + `toast.success` + `toast.error` around a write — that's `apiAction`'s job.
- Check the return value. `null` means the call failed and was already surfaced to the user.

**Parallel server fetches (when a page needs multiple resources):**

```tsx
export default async function DashboardPage() {
  const [colleges, leads] = await Promise.all([
    getColleges(1),
    getLeads({ status: "new" }),
  ]);
  return <Dashboard colleges={colleges} leads={leads} />;
}
```

- Use `Promise.all` to run independent server fetches in parallel. Never `await` them sequentially.
- If one fetch failing should not block the whole page, wrap it in a `try/catch` and pass `null` as the prop — render an inline empty state for that section instead.

**7. State Management (Zustand):**

- Zustand stores live in `store/`. One file per domain (`auth.store.ts`, future: `filters.store.ts`, etc.).
- `store/index.ts` re-exports all stores — import from `@/store`, never from the store file directly.
- Stores hold **global UI state only**: auth session, cross-page filters, sidebar open/closed. Local component state stays in `useState`.
- Persist auth state with `zustand/middleware persist` + `createJSONStorage(() => localStorage)`. Use `partialize` to exclude sensitive runtime fields.
- Re-sync cookies in `onRehydrateStorage` for middleware compatibility.
- Do NOT put server data (API responses) into Zustand. Server data belongs in component state or server-fetched props.

**8. Forms & Validation:**

- All forms use **Zod** for schema validation. Define schemas in `lib/services/` alongside the service function, or import from `packages/validation` if the schema is shared.
- Use `zod.parse()` or `zod.safeParse()` before calling any service function from a form submit handler.
- Show field-level errors inline, not in a top-level toast.
- Top-level toast (via Sonner) for success/failure of the network call only.
- Controlled inputs with `useState` for simple forms. For complex multi-step forms, keep state local to the form component.

**9. API Client (`lib/api.ts`):**

- Single `api` object with typed `get`, `post`, `patch`, `put`, `delete` methods.
- Reads `Authorization` token from Zustand store (`useAuthStore.getState().token`) — never from localStorage directly.
- On `401`: clears auth store + cookie, redirects to `/login`.
- `ApiError` class carries `status`, `message`, and raw `data`. Always check `err instanceof ApiError` before accessing `.status`.
- `apiAction(fn, successMessage)`: wraps a write call with loading/success/error toasts. Returns `null` on error — check return value before using.

**10. Auth & Sessions:**

- JWT stored in two places: `localStorage` (via Zustand persist) + an `HttpOnly`-friendly cookie (for middleware).
- Middleware reads the cookie to protect routes server-side. Zustand reads from localStorage client-side.
- `setAdminTokenCookie` / `clearAdminTokenCookie` in `lib/cookies.ts` — call these in the store actions, not in components.
- `isAuthenticated` is derived from `token !== null`, not a separate boolean you set manually. Keep the store consistent.
- After login: `setAuth(admin, token)` → cookie is set → middleware allows access.
- After logout: `clearAuth()` → cookie cleared → middleware blocks protected routes.

**11. RBAC (Role-Based Access Control):**

- Role definitions and permission maps live in `lib/rbac.ts`. Never hard-code role checks in components.
- `can(role, permission)` and `canAny(role, permissions[])` are pure functions — easy to test.
- `useRbac()` hook: wraps store access + rbac functions. Components use this, never the store directly.
- `<RoleGuard permission="x.manage">` wraps UI elements that require a permission. Use `fallback` prop to show disabled state instead of hiding entirely when UX requires it.
- Permission format: `<resource>.<action>` (e.g., `colleges.view`, `admins.manage`).
- Super admin gets all permissions. Sub admin gets view-only plus specific manage permissions.

**12. Component Rules:**

- **UI primitives** (`components/ui/`): shadcn/ui components. Do NOT modify their internals. Extend via `className` prop and Tailwind utilities.
- **Layout components** (`components/layout/`): Sidebar, Header, Shell. Keep them free of business logic — only navigation and auth display.
- **Feature components** (`components/[feature]/`): One directory per feature/domain. Keep them colocated with their page if only used once.
- **No default exports** — except `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `middleware.ts` (Next.js file conventions require it).
- **No barrel files** (`index.ts` re-exporting everything). Import directly from the file.
- Props interfaces: define inline or in the same file. Only extract to a shared types file if used across 3+ components.

**13. Styling (Tailwind CSS):**

- Tailwind utility classes only. No custom CSS except `globals.css` (base resets, CSS variables for design tokens).
- Use `cn()` (`clsx` + `tailwind-merge`) for conditional class composition. Never string-concatenate class names.
- Design tokens (colors, radii, spacing) defined as CSS variables in `globals.css`, referenced in `tailwind.config.ts`. Never hardcode hex values.
- Responsive: mobile-first (`sm:`, `md:`, `lg:` breakpoints). Dashboard layouts use `lg:` for the sidebar breakpoint.
- Dark mode: via Tailwind `dark:` variants if needed. Class-based, not media-query-based.

**14. TypeScript Rules:**

- `strict: true`. No `any`, no `@ts-ignore`, no type assertions (`as X`) unless unavoidable with an inline comment explaining why.
- Explicit return types on all functions exported from `lib/` and `hooks/`. Component return types inferred by React is fine.
- Use types from `packages/types` for all API response shapes. Do NOT redefine DTO types in the frontend.
- `camelCase` variables/functions, `PascalCase` types/interfaces/components, `UPPER_SNAKE_CASE` constants.
- Absolute imports: `@/components/`, `@/lib/`, `@/store/`, `@/hooks/`, `@beaconu/types`.

**15. Error Handling:**

**Three layers — each handles a different scope:**

```
global-error.tsx     → catches errors thrown inside the root layout (fatal, full-page crash)
error.tsx            → catches errors thrown inside a route segment (page-level, recoverable)
ErrorBoundary        → wraps individual widgets/sections in Client Component trees
```

**`error.tsx` (route segment — most common):**

- Must be a Client Component (`'use client'`).
- Receives `error: Error & { digest?: string }` and `reset: () => void`.
- Always log to `console.error` in a `useEffect` — do not log in render.
- Show the `error.digest` when present — it's the server-side error ID, useful for support.
- Provide two escapes: **Try again** (calls `reset()`) and **Go to Dashboard** (`<Link href="/">`).

```tsx
"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ?? "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono pt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={reset}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try again
        </Button>
        <Button size="sm" asChild>
          <Link href="/">
            <Home className="mr-2 h-3.5 w-3.5" /> Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

**`global-error.tsx` (root — fatal crashes only):**

- Must render its own `<html>` and `<body>` — it replaces the root layout entirely when it fires.
- Keep it dependency-light: no shadcn components, no Tailwind classes that rely on CSS variables that may not have loaded. Inline styles or raw Tailwind hardcoded values only.
- Never import from the app's own components here — the layout may be what crashed.

```tsx
"use client";
import { useEffect } from "react";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
        {/* minimal recovery UI — no app dependencies */}
        <button onClick={reset}>Reload</button>
      </body>
    </html>
  );
}
```

**`<ErrorBoundary>` (widget-level — class component):**

- Use `components/error-boundary.tsx` — a React class component. Do not re-implement it per-feature.
- Wrap independent sections of a Client Component page that can fail independently (a chart, a data widget) so one failure doesn't blank the whole screen.
- Accepts optional `fallback` prop for a custom error state; otherwise renders a default card with a reset button.
- `componentDidCatch` logs the error + component stack — never suppress this.

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <CollegeStatsWidget />
</ErrorBoundary>;
```

**Error handling in Client Component reads:**

```tsx
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  getColleges(1)
    .then(setData)
    .catch((err) => {
      setError(
        err instanceof ApiError ? err.message : "Failed to load colleges",
      );
      console.error("[CollegesTable]", err);
    })
    .finally(() => setIsLoading(false));
}, []);

if (error)
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );
```

**ApiError status → user-visible message:**

| Status | Cause                | User message                                           |
| ------ | -------------------- | ------------------------------------------------------ |
| `401`  | Session expired      | Handled globally — auto-redirect to `/login`           |
| `403`  | Missing permission   | "You don't have permission to do this"                 |
| `404`  | Resource not found   | "Not found"                                            |
| `409`  | Conflict (duplicate) | Use `err.message` from the backend — it's specific     |
| `422`  | Validation failure   | Use `err.message` — backend returns field-level detail |
| `500`  | Server error         | "Something went wrong. Try again in a moment."         |

- Never show raw error objects or stack traces to the user.
- Never swallow errors silently. Every `catch` block must either set visible error state or call `console.error`.
- Write operations: `apiAction()` handles all toasting — no extra catch needed in the component.
- Read operations: `catch` → set local `error` state → render inline error UI.

**16. Loading & Suspense:**

**Three loading contexts — each has the right tool:**

| Context                               | Tool                                   |
| ------------------------------------- | -------------------------------------- |
| Route navigation (RSC page loads)     | `loading.tsx` + Skeleton               |
| In-component data fetch (`useEffect`) | local `isLoading` state + Skeleton     |
| Write operation (form submit, delete) | `apiAction()` → Sonner `toast.loading` |

**`loading.tsx` (route-level Suspense fallback):**

- Next.js automatically wraps each route segment in a `<Suspense>` boundary. `loading.tsx` is its fallback — shown instantly on navigation while the async `page.tsx` resolves.
- **Mirror the real layout exactly.** Every card, table row, header element, and column gets a matching `<Skeleton>`. Off-by-one skeletons cause layout shift when the real content arrives.
- Build named skeleton sub-components (`StatCardSkeleton`, `TableSkeleton`, `LeadListSkeleton`) that map 1:1 to the real components. Keep them in the same `loading.tsx` file — they're not reused elsewhere.
- Match widths, heights, border-radii, and spacing to the real UI. Use the same grid/flex layout as the page so nothing jumps.

```tsx
// app/(dashboard)/colleges/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function CollegeRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0">
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-3.5 w-10" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export default function CollegesLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header skeleton — same height as real Header component */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="p-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </CardHeader>
          {/* Same row count as default page size */}
          {Array.from({ length: 10 }).map((_, i) => (
            <CollegeRowSkeleton key={i} />
          ))}
        </Card>
      </div>
    </div>
  );
}
```

**In-component loading state (`isLoading` + Skeleton):**

Use this when a Client Component fetches data after mount (pagination, search, tab switching) — `loading.tsx` only fires on initial navigation, not on client-side state changes.

```tsx
"use client";
const [isLoading, setIsLoading] = useState(true);

if (isLoading) return <TableSkeleton rows={10} />;
```

- The skeleton component must be a sibling in the same file or imported from a dedicated `*Skeleton.tsx` file — not from `loading.tsx`.
- Match row count to the page size used in the real fetch (e.g., if you fetch 10 colleges, render 10 skeleton rows).

**Write operation feedback — `apiAction()` / Sonner only:**

- Never show a full-page or section skeleton during a write (POST/PATCH/DELETE). The user is not waiting for a page to load — they're waiting for an action to confirm.
- `apiAction()` calls `toast.loading('Saving...')` automatically. The button should also show a disabled + loading state so the user cannot double-submit.

```tsx
const [isPending, setIsPending] = useState(false);

async function handleSubmit(data: CreateCollegeDto) {
  setIsPending(true);
  const result = await apiAction(() => createCollege(data), "College created");
  setIsPending(false);
  if (result) router.push("/colleges");
}

<Button disabled={isPending}>
  {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
  Create College
</Button>;
```

**Rules:**

- `loading.tsx` skeleton must match the real page layout — column count, card count, spacing.
- Skeleton row count = default API page size for that route.
- No spinners inside content areas. Spinners are for buttons and action feedback only.
- Never show a blank white/empty div while loading — always a skeleton or a `loading.tsx`.
- Do not set `isLoading = false` before data is actually ready to render. Set it in `.finally()`.
- Never conditionally render both a skeleton AND real content simultaneously — it causes flicker.

**17. File Naming Conventions:**

- Next.js reserved files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` — lowercase.
- Components: `PascalCase.tsx` (e.g., `CollegeTable.tsx`, `LoginForm.tsx`).
- Hooks: `use-kebab-case.ts` (e.g., `use-rbac.ts`, `use-colleges.ts`).
- Services: `kebab-case.service.ts` (e.g., `auth.service.ts`, `colleges.service.ts`).
- Stores: `kebab-case.store.ts` (e.g., `auth.store.ts`).
- Lib utilities: `kebab-case.ts` (e.g., `api.ts`, `rbac.ts`, `constants.ts`).

**18. Performance:**

- Prefer Server Components for static/data-heavy pages — they have zero JS bundle cost.
- Use `next/image` for all images. Never raw `<img>`. Set explicit `width` and `height` or use `fill` with a sized container.
- Use `next/link` for all internal navigation. Never `<a href>` for internal routes.
- Dynamic imports (`next/dynamic`) for heavy Client Components not needed on initial load (modals, charts, rich editors).
- Do not import large libraries at the module level in Client Components — it bloats the bundle. Use dynamic import or tree-shake.

**19. College Scoping (for college-admin and college-web):**

- Every API call from college-scoped apps must include the `college_id` in the request (as path param or body). The backend enforces this, but the frontend must send it consistently.
- `college_id` comes from the staff session (stored in auth store after login). Never hardcode or guess it.
- If `college_id` is missing from the session, redirect to login — the session is corrupted.

**20. Anti-Patterns (DO NOT BUILD):**

- `useEffect` for initial page data loads — use Server Components or route-level data fetching.
- Raw `fetch()` calls inside components — use service functions in `lib/services/`.
- Business logic in components — components render state, they don't compute it.
- Prop drilling more than 2 levels — extract a context or move state to Zustand.
- Modifying shadcn/ui component internals — extend via `className` or wrap with a new component.
- `any` type or casting API responses without Zod validation.
- Storing server data (API responses) in Zustand — that's what component state and RSC props are for.
- Barrel files (`index.ts` re-exporting everything from a folder).
- Default exports on non-Next.js-reserved files.
- `localStorage` access in Server Components — it doesn't exist server-side.
- Multiple Zustand stores for the same domain — one store per domain.

**21. Mock Data Pattern:**

- During development before the backend is ready: mock service functions behind an `isMock` flag (`NEXT_PUBLIC_MOCK_AUTH=true` or no `NEXT_PUBLIC_API_URL` set).
- Mock data lives inside the service file, gated by the flag. Remove mocks before merging to `develop`.
- Never commit mock data as the default — the flag must be explicitly set in `.env.local`.

**22. Pre-Code Checklist:**

1. Is this a Server or Client Component? Default to server unless a hook/browser API is needed.
2. Data fetching in a Server Component page? Use `async/await` directly, not `useEffect`.
3. Write operation? Use `apiAction()` — don't manually toast loading/success/error.
4. Form submit? Validate with Zod before calling any service.
5. API call in a component? It must go through a `lib/services/` function, not raw `api.*` call.
6. State that outlives the component? Put it in Zustand. Local UI state stays in `useState`.
7. New route? Add `loading.tsx` and `error.tsx`.
8. Permission-gated UI? Use `<RoleGuard>` or `useRbac()`.
9. Image? Use `next/image`. Link? Use `next/link`.
10. Type comes from backend? Import from `@beaconu/types`, don't redefine it.
11. Conditional classes? Use `cn()`, not template literals.
12. College-scoped app? Confirm `college_id` is included in every mutating API call.

**23. Mental Model:**

- **Server Component** = fetches data, renders HTML, zero bundle cost
- **Client Component** = interactivity, local state, browser APIs
- **Service** = typed wrapper around one API endpoint
- **Store** = global client-side state (auth, cross-page filters)
- **Component** = renders state, does not compute business rules
- **Middleware** = the only auth guard — never guard inside page components
