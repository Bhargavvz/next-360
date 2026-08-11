<div align="center">

# 🟢 Next360

### Shop verified. Buy with confidence.

**Trust-First Multi-Vendor Marketplace for Verified Organic Products**

</div>

---

## What is Next360?

Next360 is a multi-vendor marketplace focused on organic, natural, and eco-friendly products. Unlike generic marketplaces, Next360 puts **trust and transparency** at the center:

- ✅ **Verified Organic** — Every organic product requires NPOP certification, verified by the Next360 team
- 🛡️ **Verified Sellers** — All sellers undergo KYC verification before listing
- 📋 **Transparent Certification** — Buyers can view actual certificate details
- 🔍 **QR Verification** — Scan any product to verify its certification status

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Mobile** | React Native + Expo (TypeScript) |
| **Web** | Next.js 16 + Tailwind CSS + shadcn/ui |
| **Backend** | Spring Boot 4.1 (Java 21) |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Storage** | AWS S3 |
| **AI** | FastAPI (Python) |
| **Infrastructure** | Docker + Nginx + GitHub Actions |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/next360.git
cd next360

# 2. Setup
cp .env.example .env
pnpm install

# 3. Start infrastructure
cd infrastructure
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis -d

# 4. Start backend
cd ../backend/next360-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 5. Start web (new terminal)
cd ../..
pnpm dev:web

# 6. Start mobile (new terminal)
cd apps/mobile
npx expo start
```

## Project Structure

```
next360/
├── apps/
│   ├── mobile/          # React Native + Expo buyer app
│   └── web/             # Next.js buyer web + seller + admin dashboards
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── api-client/      # Axios-based API client
│   ├── validation/      # Shared Zod schemas
│   ├── utils/           # Shared utilities
│   └── typescript-config/ # Shared tsconfig
├── backend/
│   └── next360-api/     # Spring Boot API (modular monolith)
├── ai/
│   └── next360-ai/      # FastAPI AI service
├── infrastructure/
│   ├── docker-compose.yml
│   ├── nginx/
│   └── scripts/
├── docs/                # Documentation
└── .github/workflows/   # CI/CD
```

## Product Classifications

| Type | Badge | Certification |
|------|-------|---------------|
| **Organic** | 🟢 NPOP VERIFIED | Required, admin-verified |
| **Natural** | 🟡 NATURAL — UNVERIFIED | Not required |
| **Eco-Friendly** | 🔵 ECO-FRIENDLY — UNVERIFIED | Not required |

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Local Development Setup](docs/deployment/local-setup.md)
- [Git Workflow](docs/development/git-workflow.md)
- API Docs: `http://localhost:8080/swagger-ui.html` (after starting backend)

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Architecture | ✅ Complete | Monorepo, scaffolds, Docker, CI |
| 2. Database | ⬜ Pending | Schema, migrations, seed data |
| 3. Authentication | ⬜ Pending | OTP, JWT, RBAC |
| 4. Seller + Certification | ⬜ Pending | KYC, products, certificates |
| 5. Buyer Commerce | ⬜ Pending | Search, cart, checkout |
| 6. Marketplace Ops | ⬜ Pending | Orders, payments, shipping |
| 7. Admin | ⬜ Pending | Dashboard, moderation |
| 8–15 | ⬜ Pending | Reviews, QR, AI, Production |

---

<div align="center">

**Next360** — *Discover. Verify. Buy with confidence.*

</div>
