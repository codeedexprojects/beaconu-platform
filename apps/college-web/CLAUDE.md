# college-web — CLAUDE.md

Read root CLAUDE.md § Frontend. All rules apply here.

## Purpose

Per-college public site, resolved by subdomain (`{slug}.beaconu.in`, `{slug}.localhost:3001`
in dev). Used for referral link redirection and displays college details — profile, courses,
campuses, amenities — sourced entirely from data entered in `college-admin`. Students also
apply, pay fees, and use hostel/commute/Student Hub features here once authenticated.

## Subdomain Resolution

`proxy.ts` reads the `Host` header via `lib/host-routing.ts` to resolve the college slug.
Route params (`[subdomain]`) are the source of truth for data fetching in Server Components —
never re-derive the slug from the host inside a page/component.
