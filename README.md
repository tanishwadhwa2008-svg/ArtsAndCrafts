# Arts &amp; Handicrafts — Seller Portal

A professional, scalable, OWASP Top 10-conscious storefront platform for arts and
handicrafts, built on the **PERN** stack (PostgreSQL, Express, React, Node) in a
TypeScript monorepo.

Phase 1 delivers the **single-shop seller/admin portal**. The architecture keeps the
**API layer** and **presentation layer** cleanly separated and lays foundations for
future **customer** and **wholesale** apps.

## Monorepo layout

```
arts/
├─ apps/
│  ├─ api/          # Express + TypeScript API (the API layer)
│  └─ seller-web/   # React + Vite + Tailwind seller portal (presentation layer)
├─ packages/
│  ├─ shared/       # Shared types, constants & Zod schemas (used by API + web)
│  └─ config/       # Shared tsconfig / ESLint / Prettier presets
├─ docker-compose.yml  # Local Postgres + MinIO (S3-compatible) infrastructure
└─ turbo.json          # Turborepo task pipeline
```

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Language       | TypeScript (end to end)                            |
| Package/mono   | pnpm workspaces + Turborepo                        |
| API            | Node + Express, Prisma (later), Zod validation     |
| Database       | PostgreSQL                                         |
| Auth           | Self-managed JWT (access + rotating refresh)       |
| Frontend       | React + Vite + Tailwind CSS + shadcn/ui (later)    |
| Object storage | MinIO locally (S3-compatible), S3/Cloudinary later |

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for Postgres + MinIO)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env   # then edit secrets

# 3. Start local infrastructure (Postgres + MinIO)
pnpm docker:up

# 4. Run everything in dev mode
pnpm dev
```

Services when running:

- Seller web: http://localhost:5173
- API health: http://localhost:4000/health
- MinIO console: http://localhost:9001

## Common scripts (run from the repo root)

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Run all apps/packages in watch mode |
| `pnpm build`       | Build all packages via Turborepo    |
| `pnpm lint`        | Lint the whole workspace            |
| `pnpm typecheck`   | Type-check the whole workspace      |
| `pnpm format`      | Format with Prettier                |
| `pnpm docker:up`   | Start Postgres + MinIO              |
| `pnpm docker:down` | Stop local infrastructure           |

## Roadmap

- **Phase 0 — Monorepo & tooling foundation** ✅ (this commit)
- Phase 1 — Prisma data model (future-proofed schema)
- Phase 2 — API core (security middleware, `/api/v1`, error handling)
- Phase 3 — Auth (self-managed JWT, RBAC)
- Phase 4 — Seller feature APIs (catalog, inventory, media)
- Phase 5 — Seller web UI
- Phase 6 — Analytics dashboard
- Phase 7 — OWASP hardening & QA

## Security posture

Security is built in per phase, mapped to the OWASP Top 10 (access control, injection,
crypto, misconfiguration, vulnerable components, auth failures, logging, SSRF, etc.).
Never commit `.env`; secrets stay out of version control.
