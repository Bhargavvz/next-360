#!/bin/bash
# ============================================================
# Next360 — Development Setup Script
# ============================================================

set -e

echo "🟢 Next360 — Setting up development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Run: npm install -g pnpm"; exit 1; }
command -v java >/dev/null 2>&1 || { echo "⚠️  Java 21 is required for the backend. Install from https://adoptium.net"; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker is required for infrastructure. Install from https://docker.com"; }

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "✅ .env already exists"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
pnpm install

# Build shared packages
echo "🔨 Building shared packages..."
pnpm build:packages

echo ""
echo "============================================================"
echo "✅ Next360 development environment is ready!"
echo "============================================================"
echo ""
echo "Quick start commands:"
echo ""
echo "  # Start infrastructure (PostgreSQL + Redis)"
echo "  cd infrastructure && docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis -d"
echo ""
echo "  # Start Next.js web app"
echo "  pnpm dev:web"
echo ""
echo "  # Start Spring Boot backend"
echo "  cd backend/next360-api && ./mvnw spring-boot:run"
echo ""
echo "  # Start mobile app"
echo "  pnpm dev:mobile"
echo ""
echo "  # Start everything in Docker"
echo "  cd infrastructure && docker compose up --build"
echo ""
