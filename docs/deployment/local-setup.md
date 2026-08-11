# Next360 — Local Development Setup

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Java** 21 ([Adoptium](https://adoptium.net))
- **Docker** & Docker Compose ([Download](https://docker.com))
- **Maven** 3.9+ (or use the included Maven wrapper)

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/next360.git
cd next360
cp .env.example .env
pnpm install
```

### 2. Start Infrastructure

```bash
cd infrastructure
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis -d
```

### 3. Start Backend

```bash
cd backend/next360-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API available at: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4. Start Web App

```bash
pnpm dev:web
```

Web available at: `http://localhost:3000`

### 5. Start Mobile App

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go app.

## Start Everything with Docker

```bash
cd infrastructure
docker compose up --build
```

All services available at: `http://localhost`

## Development Ports

| Service | Port | URL |
|---------|------|-----|
| Next.js | 3000 | http://localhost:3000 |
| Spring Boot | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 80 | http://localhost |
| Expo | 8081 | http://localhost:8081 |
| Swagger | 8080 | http://localhost:8080/swagger-ui.html |
