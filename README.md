# BeaconU Platform

Multi-tenant college admission platform. One Express API serves four client applications (BeaconU Launchpad, Blink, College Web, College Admin) sharing a single PostgreSQL database. All business logic lives in the backend; frontends are thin API consumers.

## Tech Stack

| Layer         | Technology                  |
| ------------- | --------------------------- |
| Monorepo      | Turborepo + pnpm workspaces |
| Backend API   | Express 5 + TypeScript      |
| Frontend      | Next.js 16 (App Router)     |
| Database      | PostgreSQL 16 + Prisma 7    |
| Cache / Queue | Redis + BullMQ              |
| Validation    | Zod v4                      |
| File Storage  | AWS S3 (pre-signed URLs)    |
| Payments      | Razorpay Marketplace        |
| Logger        | Pino                        |

## Prerequisites

- Node.js 20 LTS (`nvm use` to pick up `.nvmrc`)
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 16+
- Redis 7+

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd beaconu-platform

# 2. Install dependencies
pnpm install

# 3. Copy env and fill in values
cp .env.example .env

# 4. Start PostgreSQL and Redis (or use Docker)
# PostgreSQL: createdb beaconu
# Redis: redis-server

# 5. Run migrations
pnpm db:migrate:dev

# 6. Seed initial data
pnpm db:seed

# 7. Start all apps
pnpm dev
```

## Running Individual Apps

```bash
pnpm dev:api          # Express API on port 4000
pnpm dev:web          # BeaconU Launchpad on port 3000
pnpm dev:college-web  # College Web Portal on port 3001
pnpm dev:college-admin # College Admin Panel on port 3002
```

## Database

```bash
# Run a new migration (replace <name> with a descriptive name)
pnpm db:migrate:dev -- --name add_some_table

# Deploy migrations in production
pnpm db:migrate

# Open Prisma Studio (visual DB browser)
pnpm db:studio

# Push schema without migration (prototyping only)
pnpm db:push

# Regenerate Prisma client after schema changes
pnpm db:generate
```

## Project Structure

```
beaconu-platform/
├── apps/
│   ├── api/            # Express + TypeScript backend (port 4000)
│   ├── web/            # BeaconU Launchpad — Next.js (port 3000)
│   ├── college-web/    # College Web Portal — Next.js (port 3001)
│   └── college-admin/  # College Admin Panel — Next.js (port 3002)
├── packages/
│   ├── db/             # Prisma schema, migrations, client singleton
│   ├── types/          # Shared DTOs, enums, interfaces (used by all apps)
│   ├── validation/     # Shared Zod schemas
│   └── utils/          # Pure utility functions (no DB, no side effects)
├── docs/
│   ├── backend-rules.md     # Architecture decisions and coding standards
│   ├── db-context.md        # Full database design context
│   └── db-schema-reference.md
├── .env.example        # Template for required environment variables
└── turbo.json          # Turborepo pipeline configuration
```

### API Module Structure

Each feature lives in `apps/api/src/modules/<name>/`:

```
modules/
  admissions/
    controllers/   # Validate input → call service/query → return response
    services/      # All business logic
    repositories/  # Writes + simple reads (no complex joins)
    queries/       # Complex reads, joins, aggregations (no writes)
    validators/    # Zod schemas for request validation
```

See [docs/backend-rules.md](docs/backend-rules.md) before adding any module.

## Environment Variables

| Variable                  | Description                         | Example                                         | Required                  |
| ------------------------- | ----------------------------------- | ----------------------------------------------- | ------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string        | `postgresql://user:pass@localhost:5432/beaconu` | Yes                       |
| `REDIS_URL`               | Redis connection string             | `redis://localhost:6379`                        | Yes                       |
| `JWT_SECRET`              | JWT signing secret (min 32 chars)   | `your-secret-here`                              | Yes                       |
| `JWT_REFRESH_SECRET`      | Refresh token secret (min 32 chars) | `your-refresh-secret`                           | Yes                       |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID              | `xxx.apps.googleusercontent.com`                | Yes                       |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret          | `GOCSPX-xxx`                                    | Yes                       |
| `RAZORPAY_KEY_ID`         | Razorpay API key                    | `rzp_test_xxx`                                  | Yes                       |
| `RAZORPAY_KEY_SECRET`     | Razorpay API secret                 | `xxx`                                           | Yes                       |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret             | `xxx`                                           | Yes                       |
| `AWS_ACCESS_KEY_ID`       | AWS IAM access key                  | `AKIA...`                                       | Yes                       |
| `AWS_SECRET_ACCESS_KEY`   | AWS IAM secret key                  | `xxx`                                           | Yes                       |
| `AWS_S3_BUCKET`           | S3 bucket name                      | `beaconu-uploads`                               | Yes                       |
| `AWS_REGION`              | AWS region                          | `ap-south-1`                                    | Yes                       |
| `PORT`                    | API server port                     | `4000`                                          | No (default: 4000)        |
| `NODE_ENV`                | Runtime environment                 | `development`                                   | No (default: development) |

If presigned S3 uploads fail in browser with `OPTIONS 403`, apply bucket CORS:

- See `docs/api/s3-upload-cors-fix.md`

## Available Scripts

| Script                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| `pnpm dev`               | Start all apps in dev mode                  |
| `pnpm dev:api`           | Start API only                              |
| `pnpm dev:web`           | Start BeaconU web only                      |
| `pnpm dev:college-web`   | Start College Web only                      |
| `pnpm dev:college-admin` | Start College Admin only                    |
| `pnpm build`             | Build all apps and packages                 |
| `pnpm build:api`         | Build API only                              |
| `pnpm lint`              | Lint all packages                           |
| `pnpm type-check`        | TypeScript check all packages               |
| `pnpm format`            | Format all files with Prettier              |
| `pnpm clean`             | Remove all build artifacts and node_modules |
| `pnpm db:generate`       | Regenerate Prisma client                    |
| `pnpm db:migrate:dev`    | Run migrations in development               |
| `pnpm db:migrate`        | Deploy migrations (production)              |
| `pnpm db:seed`           | Run database seed script                    |
| `pnpm db:studio`         | Open Prisma Studio                          |
| `pnpm db:push`           | Push schema without migration               |

## Health Check

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-04T00:00:00.000Z",
    "uptime": 42,
    "database": "connected",
    "redis": "connected"
  }
}
```
