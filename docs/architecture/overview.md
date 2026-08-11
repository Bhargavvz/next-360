# Next360 — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLIENTS                          │
├─────────────┬──────────────┬────────────────────────┤
│ Mobile App  │   Web App    │  Seller/Admin Dashboard │
│ React Native│  Next.js 16  │    Next.js 16           │
│ Expo SDK 57 │ Tailwind CSS │   shadcn/ui             │
└──────┬──────┴──────┬───────┴──────┬─────────────────┘
       │             │              │
       └─────────────┼──────────────┘
                     │ HTTPS
                     ▼
          ┌──────────────────┐
          │      Nginx       │
          │  Reverse Proxy   │
          │  Rate Limiting   │
          │  SSL Termination │
          └────────┬─────────┘
         ┌─────────┼──────────┐
         ▼         ▼          ▼
    ┌─────────┐ ┌──────┐ ┌────────┐
    │ Next.js │ │Spring│ │FastAPI │
    │   SSR   │ │ Boot │ │  AI    │
    │ :3000   │ │ :8080│ │ :8000  │
    └─────────┘ └──┬───┘ └────────┘
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
    ┌──────────┐ ┌─────┐ ┌────┐
    │PostgreSQL│ │Redis│ │ S3 │
    │  :5432   │ │:6379│ │    │
    └──────────┘ └─────┘ └────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile | React Native + Expo | Buyer mobile app (iOS/Android) |
| Web | Next.js 16 + Tailwind + shadcn/ui | Buyer web, Seller dashboard, Admin panel |
| Backend | Spring Boot 4.1 + Java 21 | REST API, business logic, security |
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | Caching, rate limiting, sessions |
| Storage | AWS S3 | Files (images, certificates, KYC) |
| AI | FastAPI + Python 3.12 | Recommendations, search, moderation |
| Proxy | Nginx | Reverse proxy, SSL, rate limiting |
| CI/CD | GitHub Actions | Build, test, deploy |
| Containers | Docker + Docker Compose | Local dev and deployment |

## Architecture Decisions

1. **Modular Monolith** — Backend starts as a single Spring Boot application with clear domain modules. Avoids premature microservice complexity while maintaining clean boundaries.

2. **Turborepo Monorepo** — Frontend (web + mobile) and shared packages in one repository for code sharing, atomic changes, and consistent tooling.

3. **Trust-First Design** — Product visibility rules are enforced server-side. Frontend cannot bypass certification/approval checks.

4. **API-First** — All clients consume the same versioned REST API (`/api/v1/`).
