# BeaconU Frontend — CLAUDE.md

## Applies to apps/web, apps/college-web, apps/college-admin, apps/super-admin. Read root CLAUDE.md first.

---

## Stack

Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix primitives), Zustand, Zod, Sonner, Lucide React. Turborepo + pnpm.

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
  global-error.tsx           Fatal crash — renders own <html><body>, no app imports
  not-found.tsx
  globals.css
components/
  ui/                        shadcn/ui — DO NOT modify internals
  layout/                    Sidebar, Header, Shell — no business logic
  [feature]/                 Feature components colocated with their page
  error-boundary.tsx         Reusable React class ErrorBoundary
hooks/                       use-kebab-case.ts
lib/
  api.ts                     Single typed fetch client
  cookies.ts                 Cookie read/write (for middleware compat)
  rbac.ts                    Permission map + can() / canAny()
  services/                  One file per domain: colleges.service.ts etc.
store/
  auth.store.ts              Zustand auth (persisted)
  index.ts                   Re-exports only
middleware.ts                Auth guard + redirects — ONLY place for auth redirects
```

## Server vs Client Components

- Default: **Server Component**
- Add `'use client'` only for: hooks, browser APIs, event handlers, Zustand access
- Never `'use client'` on layout files
- Initial data: `async/await` in RSC — never `useEffect` for initial page loads

## Data Fetching

**Server (RSC page.tsx):**

```tsx
export default async function Page() {
  const data = await getColleges(1); // throws → error.tsx catches automatically
  return <CollegesTable initialData={data} />;
}
// Parallel fetches — never sequential awaits:
const [colleges, stats] = await Promise.all([getColleges(1), getStats()]);
```

- Real-time: `cache: 'no-store'`. Stale-ok: `next: { revalidate: N }`
- One optional failing fetch: wrap in try/catch, pass null as prop, render inline empty state

**Client (interactive component):**

```tsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
  getColleges(1)
    .then(setData)
    .catch((e) =>
      setError(e instanceof ApiError ? e.message : "Failed to load"),
    )
    .finally(() => setIsLoading(false));
}, []);
if (isLoading) return <TableSkeleton rows={10} />;
if (error) return <InlineError message={error} />;
```

**Writes — always `apiAction()`:**

```tsx
const result = await apiAction(() => createCollege(data), "College created");
if (!result) return; // error already toasted — always check return value
router.push("/colleges");
```

`apiAction()` handles loading/success/error toasts. Never manually toast around a write.

**Rule:** One fetch location per page — RSC or client, not both.

## Service Functions

```ts
// lib/services/colleges.service.ts
export async function getColleges(
  page: number,
): Promise<PaginatedResponse<College>> {
  return api.get(`/api/v1/admin/colleges?page=${page}`);
}
```

- One file per domain. Components NEVER call `api.*` directly — always through service functions.
- Explicit return type matching DTO from `@beaconu/types`.

## State (Zustand)

- Global UI state only: auth session, cross-page filters, sidebar state
- Server data (API responses): NOT in Zustand — component state or RSC props
- Local UI state: `useState`
- Auth store: `persist` middleware + `createJSONStorage(() => localStorage)`. Re-sync cookie in `onRehydrateStorage`.
- Import from `@/store` not from store file directly

## Forms

- Zod schema → `.parse()` before service call
- Field-level errors inline. Network success/failure as Sonner toast.
- Simple: `useState`. Multi-step: local form component state.

## RBAC

```tsx
const { can } = useRbac();
if (can('colleges.manage')) { ... }
<RoleGuard permission="colleges.manage" fallback={<DisabledButton />}>
```

Permission format: `resource.action`. Never hard-code role checks in components. `lib/rbac.ts` owns the permission map.

## Loading States

| Context                  | Tool                         |
| ------------------------ | ---------------------------- |
| Route navigation         | `loading.tsx` + Skeleton     |
| Client `useEffect` fetch | local `isLoading` + Skeleton |
| Write operation          | `apiAction()` → Sonner toast |

**`loading.tsx` rules:**

- Mirror real layout exactly: same grid/flex, same column count, same card structure
- Skeleton row count = default API page size for that route
- No spinners in content areas — spinners on buttons only
- Never blank white div while loading

**Write pending state:**

```tsx
const [isPending, setIsPending] = useState(false);
async function handleSubmit(data) {
  setIsPending(true);
  const result = await apiAction(() => createCollege(data), "College created");
  setIsPending(false);
  if (result) router.push("/colleges");
}
<Button disabled={isPending}>
  {isPending && <Spinner className="mr-2 h-4 w-4" />} Create College
</Button>;
```

## Error Handling

**`error.tsx` (route segment — most common):**

```tsx
"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error]", error);
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

- `'use client'`. Log in `useEffect`. Show `error.digest`. Two escapes: reset + home.

**`global-error.tsx` (fatal — root layout crash):**

- Renders own `<html><body>`. No shadcn, no app imports, no CSS variables. Inline styles only.

**`<ErrorBoundary>` (widget-level):**

- `components/error-boundary.tsx` — React class component. Don't re-implement per feature.
- Wrap independent sections that can fail without blanking the whole page.
- `componentDidCatch` must log error + component stack.

**ApiError status → user message:**
| Status | Message |
|---|---|
| 401 | Auto-redirect to login |
| 403 | "You don't have permission" |
| 404 | "Not found" |
| 409/422 | Use `err.message` from backend |
| 500 | "Something went wrong. Try again." |

Never show raw error objects. Never swallow silently — every catch must set error state or `console.error`.

## API Client (`lib/api.ts`)

- Reads token from `useAuthStore.getState().token` — never from localStorage directly
- On `401`: clears auth store + cookie → redirect to `/login`
- `ApiError` class: `.status`, `.message`, `.data`

## Auth & Sessions

- JWT: `localStorage` via Zustand persist + `HttpOnly`-friendly cookie (for middleware)
- Middleware reads cookie server-side. Zustand reads localStorage client-side.
- `isAuthenticated` derived from `token !== null` — not a manually set boolean
- Login: `setAuth(user, token)` → cookie set. Logout: `clearAuth()` → cookie cleared.
- `middleware.ts` is the ONLY place for auth redirects. Never redirect inside page components.

## College Scoping (college-web + college-admin)

Every mutating API call includes `college_id` from auth store. Missing `college_id` → redirect to login.

## Styling

- Tailwind utilities only. `cn()` for conditional classes — never string concatenation.
- Design tokens as CSS variables in `globals.css` → `tailwind.config.ts`. Never hardcode hex.
- Mobile-first (`sm:` `md:` `lg:`). Sidebar breakpoint: `lg:`. Dark mode: class-based.

## Performance

- Prefer Server Components for data-heavy pages — zero JS bundle cost
- `next/image` for all images. `next/link` for all internal links.
- `next/dynamic` for heavy Client Components not needed on initial load (modals, charts, editors)

## Mock Data (dev only)

Gate behind `NEXT_PUBLIC_MOCK_AUTH=true` or missing `NEXT_PUBLIC_API_URL`. Mock data lives inside the service file. Remove before merging to `develop`. Never commit as default.

## Naming

- Next.js files: lowercase (`page.tsx` `layout.tsx` `loading.tsx` `error.tsx`)
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Services: `kebab-case.service.ts`
- Stores: `kebab-case.store.ts`
- No default exports except Next.js reserved files

## TypeScript

- `strict: true`. No `any`, no `@ts-ignore`, no `as X` without comment.
- Types from `@beaconu/types` — never redefine DTOs in frontend.
- Absolute imports: `@/components/` `@/lib/` `@/store/` `@/hooks/` `@beaconu/types`

## Anti-Patterns

No: `useEffect` for initial page data · raw `fetch()` in components · business logic in components · prop drilling 3+ levels · modifying shadcn internals · `any` on API responses · server data in Zustand · barrel files · default exports on non-Next.js files · `localStorage` in Server Components · multiple Zustand stores for same domain

## Checklist

1. Server or Client Component? Default server. 2. Initial data? RSC async/await not useEffect. 3. Write? Use `apiAction()` + check return. 4. Form? Zod validate first. 5. API call? Through service function. 6. Global state? Zustand. Local? useState. 7. New route? Add `loading.tsx` + `error.tsx`. 8. Permission-gated? `<RoleGuard>` or `useRbac()`. 9. Image? `next/image`. Link? `next/link`. 10. Backend type? Import from `@beaconu/types`. 11. Conditional classes? `cn()`. 12. College-scoped? Include `college_id`. 13. Heavy component? `next/dynamic`.
