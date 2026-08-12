#!/bin/bash
# ============================================================
# Start the Next360 backend with environment variables loaded
# Usage: ./start-backend.sh
# ============================================================

# Load .env file from repo root
if [ -f "$(dirname "$0")/../../../.env" ]; then
  set -a
  source "$(dirname "$0")/../../../.env"
  set +a
  echo "✅ Loaded .env from repo root"
else
  echo "⚠️  No .env file found — using system environment variables"
fi

# Navigate to the backend directory and start
cd "$(dirname "$0")" || exit 1
echo "🚀 Starting Next360 API..."
./mvnw spring-boot:run 2>&1
