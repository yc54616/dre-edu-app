#!/bin/sh
set -eu

# Run this inside the app container:
#   docker compose exec app sh
#   /app/scripts/migrate-in-container.sh
#
# Prerequisite:
# - materials collection is already restored in mongo container
# - /app/uploads/files contains migrated source files

DB_URI="${DB_URI:-${MONGODB_URI:-mongodb://mongo:27017/dre-edu}}"
DB_NAME="${DB_NAME:-dre-edu}"

echo ""
echo "========================================="
echo "  In-Container Migration"
echo "========================================="
echo "DB URI: $DB_URI"
echo "DB NAME: $DB_NAME"
echo ""

echo "[1-1] DRY-RUN..."
node /app/dist/migrateLegacyMaterials.js \
  --sample=10 \
  --source-uri="$DB_URI" \
  --target-uri="$DB_URI" \
  --source-db="$DB_NAME" \
  --target-db="$DB_NAME"

echo ""
echo "[1-2] APPLY..."
node /app/dist/migrateLegacyMaterials.js \
  --apply --strict-file-exists --compute-page-count \
  --source-uri="$DB_URI" \
  --target-uri="$DB_URI" \
  --source-db="$DB_NAME" \
  --target-db="$DB_NAME"

echo ""
echo "[2] AUDIT (MID)..."
node /app/dist/auditMigratedData.js \
  --uri="$DB_URI" \
  --db="$DB_NAME" \
  --out=/app/tmp/audit-mid.json

echo ""
echo "[3-1] PREVIEW DRY-RUN..."
node /app/dist/regeneratePreviews.js \
  --all \
  --uri="$DB_URI" \
  --db="$DB_NAME"

echo ""
echo "[3-2] PREVIEW APPLY..."
node /app/dist/regeneratePreviews.js \
  --apply --all --cleanup-old --refresh-page-count \
  --uri="$DB_URI" \
  --db="$DB_NAME"

echo ""
echo "[4] AUDIT (FINAL)..."
node /app/dist/auditMigratedData.js \
  --uri="$DB_URI" \
  --db="$DB_NAME" \
  --out=/app/tmp/audit-final.json

echo ""
echo "Done: /app/tmp/audit-mid.json, /app/tmp/audit-final.json"
