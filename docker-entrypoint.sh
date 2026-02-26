#!/bin/sh
set -e

# ── 마이그레이션 (볼륨 삭제 후 재구축 시 호스트에서 실행) ──
# 1) 호스트 MongoDB에 레거시 덤프 복원:
#    mongorestore --archive=materials.archive \
#      --nsFrom="dreedu.materials" --nsTo="dre-edu.materials" --drop
#
# 2) 스키마 마이그레이션:
#    npx tsx scripts/migrateLegacyMaterials.ts --apply --strict-file-exists --compute-page-count
#
# 3) 데이터 감사:
#    npx tsx scripts/auditMigratedData.ts --out=tmp/audit-mid.json
#
# 4) 미리보기 재생성:
#    npx tsx scripts/regeneratePreviews.ts --apply --all --cleanup-old --refresh-page-count
#
# 5) 최종 감사:
#    npx tsx scripts/auditMigratedData.ts --out=tmp/audit-final.json
#
# 6) 호스트 → Docker 동기화:
#    mongodump --db dre-edu --collection materials --archive=tmp/materials-migrated.archive
#    docker compose cp tmp/materials-migrated.archive mongo:/tmp/materials-migrated.archive
#    docker compose exec mongo mongorestore --archive=/tmp/materials-migrated.archive \
#      --nsFrom="dre-edu.materials" --nsTo="dre-edu.materials" --drop
#    docker compose cp uploads/files/. app:/app/uploads/files/
#    docker compose cp public/uploads/previews/. app:/app/public/uploads/previews/
#
# 전체 자동화: bash scripts/migrate-all.sh

echo "[entrypoint] Running seed..."
node seed.js || echo "[entrypoint] Seed failed (non-fatal), continuing..."

echo "[entrypoint] Starting Next.js server..."
exec node server.js
