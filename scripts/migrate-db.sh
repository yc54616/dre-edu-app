#!/bin/bash
set -euo pipefail

# Migrate MongoDB data from 'dreedu' database to 'dre-edu' database
# Run this script from the project root where docker-compose.yaml is located.

echo "=== DB Migration: dreedu → dre-edu ==="

echo "[1/2] Dumping 'dreedu' database..."
docker compose exec mongo mongodump --db dreedu --archive=/tmp/dreedu.archive

echo "[2/2] Restoring as 'dre-edu' database..."
docker compose exec mongo mongorestore --archive=/tmp/dreedu.archive \
  --nsFrom="dreedu.*" --nsTo="dre-edu.*"

echo "=== Migration complete ==="
echo "Verify with: docker compose exec mongo mongosh --eval \"db.getSiblingDB('dre-edu').getCollectionNames()\""
