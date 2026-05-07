# Database & Prisma Workflow Guide

## 1. Overview

We use:

- PostgreSQL as the database
- Prisma as ORM and migration tool

Key principle:

> Prisma migrations are the **single source of truth** for database structure.

---

## 2. Environment Structure

We use **separate databases per environment**:

| Environment   | Purpose                      |
| ------------- | ---------------------------- |
| Local DB      | Development (each developer) |
| Cloud DB      | Shared staging / testing     |
| Production DB | (future)                     |

---

## 3. Why This Setup Exists

Unlike MongoDB:

- PostgreSQL is **schema-based**
- Prisma tracks schema via **migrations**
- Migrations must be **consistent across all developers**

Using a shared dev DB causes:

- migration conflicts
- schema drift
- broken environments

---

## 4. Initial Setup (New Developer Onboarding)

## Step 1: Install PostgreSQL (Recommended: Docker)

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres
```

---

## Step 2: Create local database

```bash
createdb app
```

OR via psql:

```sql
CREATE DATABASE app;
```

---

## Step 3: Setup environment variables

Create `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"
```

---

## Step 4: Install dependencies

```bash
npm install
```

---

## Step 5: Apply existing migrations

```bash
npx prisma migrate dev
```

This will:

- Create tables
- Sync schema
- Generate Prisma client

---

## Step 6: Run project

```bash
npm run dev
```

---

## 5. Daily Development Workflow

## Step 1: Sync latest changes

```bash
git pull
npx prisma migrate dev
```

---

## Step 2: Make schema changes

Edit:

```
prisma/schema.prisma
```

---

## Step 3: Create migration

```bash
npx prisma migrate dev --name <feature_name>
```

Example:

```bash
npx prisma migrate dev --name add_student_table
```

---

## Step 4: Commit changes

Always commit:

```
prisma/schema.prisma
prisma/migrations/*
```

---

## Step 5: Before pushing

```bash
git pull origin dev
git rebase dev
npx prisma migrate dev
```

---

## Step 6: Push

```bash
git push
```

---

## 6. Important Rules (Must Follow)

### Rule 1: Never use `db push`

```bash
npx prisma db push  ❌
```

Reason:

- No migration history
- Causes schema drift

---

### Rule 2: Never edit old migrations

Once committed:

- Migrations are immutable

---

### Rule 3: Always pull before creating migrations

Prevents:

- duplicate migrations
- conflicts

---

### Rule 4: Never use shared DB for development

Do NOT run:

```bash
npx prisma migrate dev
```

on cloud DB

---

### Rule 5: Always use migrations

All schema changes must go through:

```bash
npx prisma migrate dev
```

---

## 7. Working with Shared Cloud Database

Cloud DB is used for:

- Integration testing
- QA

---

## Apply migrations to cloud DB

```bash
npx prisma migrate deploy
```

This:

- Applies existing migrations only
- Does NOT create new ones

---

## NEVER run:

```bash
npx prisma migrate dev   ❌
```

on cloud DB

---

## 8. Handling Migration Conflicts

### Case: Migration fails locally

Run:

```bash
npx prisma migrate reset
```

Then:

```bash
npx prisma migrate dev
```

This will:

- Drop local DB
- Reapply all migrations

Safe because it’s local.

---

### Case: Schema mismatch

```bash
npx prisma db pull
```

Use only for debugging, not workflow.

---

## 9. Seeding Data

Instead of sharing DB data, use seed scripts.

```bash
npx prisma db seed
```

Example:

```ts
await prisma.user.create({
  data: {
    email: 'test@example.com',
  },
});
```

---

## 10. Common Errors & Fixes

### Error: relation already exists

Cause:

- DB already has tables
- Migration history mismatch

Fix:

```bash
npx prisma migrate reset
```

---

### Error: migration conflict

Fix:

```bash
git pull
npx prisma migrate reset
npx prisma migrate dev
```

---

### Error: shadow database failure

Cause:

- Schema drift

Fix:

- Reset local DB

---

## 11. Best Practices

- One feature → one migration
- Keep migrations small and focused
- Use meaningful migration names
- Test migrations locally before pushing

---

## 12. Mental Model (Important)

Think of Prisma like this:

| MongoDB               | Prisma + PostgreSQL                  |
| --------------------- | ------------------------------------ |
| Flexible schema       | Strict schema                        |
| No migration system   | Migration-based system               |
| DB is source of truth | Migration history is source of truth |

---

## 13. Recommended Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "db:generate": "prisma generate"
  }
}
```

---

## 14. Summary

- Use local DB for development
- Use migrations for all schema changes
- Never use `db push` in team workflow
- Keep migration history consistent
- Use cloud DB only for deployment/testing
