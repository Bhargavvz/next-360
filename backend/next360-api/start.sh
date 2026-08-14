#!/bin/bash
# ============================================================
# Start the Next360 backend with environment variables loaded
# Usage: ./start-backend.sh
# ============================================================

# Load .env file from repo root (this script lives at backend/next360-api/)
ENV_FILE="$(cd "$(dirname "$0")/../.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  echo "✅ Loaded .env from $ENV_FILE"
else
  echo "⚠️  No .env file found at $ENV_FILE — using system environment variables"
fi

# Navigate to the backend directory and start
cd "$(dirname "$0")" || exit 1

# Prefer the Maven wrapper when present, otherwise fall back to a system mvn.
if [ -x "./mvnw" ]; then
  MVN="./mvnw"
elif command -v mvn >/dev/null 2>&1; then
  MVN="mvn"
else
  echo "❌ Neither ./mvnw nor mvn is available. Install Maven or add the wrapper."
  exit 1
fi

echo "🚀 Starting Next360 API with $MVN..."
"$MVN" spring-boot:run 2>&1
