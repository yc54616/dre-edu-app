#!/bin/bash
set -euo pipefail

# 레거시 dre-edu → dre-edu-app 전체 마이그레이션 스크립트
#
# 사전 준비:
#   1) uploads-backup/ 에 레거시 업로드 파일들 복사해둘 것
#   2) materials.archive 에 레거시 MongoDB 덤프 파일 준비해둘 것
#   3) docker compose up -d 로 Docker 서비스 실행해둘 것
#   4) app/mongo 컨테이너를 재빌드/재생성할 것 (dist 스크립트 반영)
#
# 실행:
#   bash scripts/migrate-all.sh

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"
INTERNAL_MONGO_URI="${INTERNAL_MONGO_URI:-mongodb://mongo:27017/dre-edu}"
INTERNAL_DB_NAME="${INTERNAL_DB_NAME:-dre-edu}"

echo ""
echo "========================================="
echo "  레거시 마이그레이션 전체 실행"
echo "========================================="
echo "project: $PROJECT_DIR"
echo ""

# ─── 사전 검증 ───

if [ ! -f materials.archive ]; then
  echo "[ERROR] materials.archive 파일이 없습니다."
  echo "  운영 서버에서 다음 명령으로 추출하세요:"
  echo "  docker compose exec mongo mongodump --db dreedu --collection materials --archive=/tmp/materials.archive"
  echo "  docker compose cp mongo:/tmp/materials.archive ./materials.archive"
  exit 1
fi

if [ ! -d uploads-backup ] || [ -z "$(ls -A uploads-backup 2>/dev/null)" ]; then
  echo "[ERROR] uploads-backup/ 디렉토리가 비어있거나 없습니다."
  echo "  운영 서버에서 다음 명령으로 추출하세요:"
  echo "  docker compose cp app:/usr/src/app/uploads/. ./uploads-backup/"
  exit 1
fi

if ! docker compose ps mongo --format '{{.State}}' 2>/dev/null | grep -q running; then
  echo "[ERROR] Docker MongoDB가 실행 중이 아닙니다."
  echo "  docker compose up -d 로 먼저 실행하세요."
  exit 1
fi

if ! docker compose ps app --format '{{.State}}' 2>/dev/null | grep -q running; then
  echo "[ERROR] Docker app 컨테이너가 실행 중이 아닙니다."
  echo "  docker compose up -d 로 먼저 실행하세요."
  exit 1
fi

echo "[OK] materials.archive 확인"
echo "[OK] uploads-backup/ 확인 ($(ls uploads-backup | wc -l)개 파일)"
echo "[OK] Docker MongoDB 실행 중"
echo "[OK] Docker app 컨테이너 실행 중"
echo ""

# ─── Step 0: 데이터 준비 ───

echo "========================================="
echo "  Step 0: 데이터 준비"
echo "========================================="

# 업로드 파일 복사
echo "[0-1] 업로드 파일 복사 → uploads/files/"
mkdir -p uploads/files
cp -a uploads-backup/* uploads/files/ 2>/dev/null || cp -a uploads-backup/files/* uploads/files/ 2>/dev/null || true
FILE_COUNT=$(ls uploads/files | wc -l)
echo "  → $FILE_COUNT개 파일 복사 완료"

# 업로드 파일을 app 볼륨으로 동기화
echo "[0-1.5] uploads/files → Docker app 볼륨"
docker compose cp uploads/files/. app:/app/uploads/files/
echo "  → Docker app 업로드 파일 동기화 완료"

# Docker MongoDB에 레거시 덤프 복원
echo "[0-2] Docker MongoDB에 레거시 덤프 복원"
docker compose cp materials.archive mongo:/tmp/materials.archive
docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('${INTERNAL_DB_NAME}').materials.drop()" || true
docker compose exec -T mongo mongorestore --archive=/tmp/materials.archive \
  --nsFrom="dreedu.materials" --nsTo="${INTERNAL_DB_NAME}.materials" --drop
DOC_COUNT=$(docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('${INTERNAL_DB_NAME}').materials.countDocuments()")
echo "  → $DOC_COUNT개 문서 복원 완료 (docker mongo)"
echo ""

# ─── Step 1: 스키마 마이그레이션 ───

echo "========================================="
echo "  Step 1: 스키마 마이그레이션"
echo "========================================="

echo "[1-1] DRY-RUN..."
docker compose exec -T app node /app/dist/migrateLegacyMaterials.js \
  --sample=10 \
  --source-uri="$INTERNAL_MONGO_URI" \
  --target-uri="$INTERNAL_MONGO_URI" \
  --source-db="$INTERNAL_DB_NAME" \
  --target-db="$INTERNAL_DB_NAME"

echo ""
echo "[1-2] APPLY..."
docker compose exec -T app node /app/dist/migrateLegacyMaterials.js \
  --apply --strict-file-exists --compute-page-count \
  --source-uri="$INTERNAL_MONGO_URI" \
  --target-uri="$INTERNAL_MONGO_URI" \
  --source-db="$INTERNAL_DB_NAME" \
  --target-db="$INTERNAL_DB_NAME"
echo ""

# ─── Step 2: 데이터 감사 ───

echo "========================================="
echo "  Step 2: 데이터 감사 (중간)"
echo "========================================="
mkdir -p tmp
docker compose exec -T app node /app/dist/auditMigratedData.js \
  --uri="$INTERNAL_MONGO_URI" \
  --db="$INTERNAL_DB_NAME" \
  --out=/app/tmp/audit-mid.json
echo ""

# ─── Step 3: 미리보기 재생성 ───

echo "========================================="
echo "  Step 3: 미리보기 재생성"
echo "========================================="

echo "[3-1] DRY-RUN..."
docker compose exec -T app node /app/dist/regeneratePreviews.js \
  --all \
  --uri="$INTERNAL_MONGO_URI" \
  --db="$INTERNAL_DB_NAME"

echo ""
echo "[3-2] APPLY... (시간이 걸릴 수 있습니다)"
docker compose exec -T app node /app/dist/regeneratePreviews.js \
  --apply --all --cleanup-old --refresh-page-count \
  --uri="$INTERNAL_MONGO_URI" \
  --db="$INTERNAL_DB_NAME"
echo ""

# ─── Step 4: 최종 감사 ───

echo "========================================="
echo "  Step 4: 최종 감사"
echo "========================================="
docker compose exec -T app node /app/dist/auditMigratedData.js \
  --uri="$INTERNAL_MONGO_URI" \
  --db="$INTERNAL_DB_NAME" \
  --out=/app/tmp/audit-final.json
echo ""

# ─── Step 5: 불량 자료 정리 ───

# echo "========================================="
# echo "  Step 5: 불량 자료 정리"
# echo "========================================="

# 파일이 없는 자료 (problemFile/ etcFile 모두 비어있음) 삭제
DELETED=$(docker compose exec -T mongo mongosh --quiet --eval "
  const r = db.getSiblingDB('${INTERNAL_DB_NAME}').materials.deleteMany({
    \$and: [
      { \$or: [ { problemFile: null }, { problemFile: '' }, { problemFile: { \$exists: false } } ] },
      { \$or: [ { etcFile: null }, { etcFile: '' }, { etcFile: { \$exists: false } } ] }
    ]
  });
  print(r.deletedCount);
")
echo "  → 파일 없는 자료 ${DELETED}개 삭제"

# # 미리보기 없는 자료 삭제
# DELETED2=$(docker compose exec -T mongo mongosh --quiet --eval "
#   const r = db.getSiblingDB('${INTERNAL_DB_NAME}').materials.deleteMany({
#     \$or: [
#       { previewImages: { \$size: 0 } },
#       { previewImages: null },
#       { previewImages: { \$exists: false } }
#     ]
#   });
#   print(r.deletedCount);
# ")
# echo "  → 미리보기 없는 자료 ${DELETED2}개 삭제"

# CLEAN_COUNT=$(docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('${INTERNAL_DB_NAME}').materials.countDocuments()")
# echo "  → 정리 후 남은 문서: ${CLEAN_COUNT}개"
# echo ""

# ─── Step 6: 최종 검증 ───

echo "========================================="
echo "  Step 6: 최종 검증"
echo "========================================="

# DB: Docker MongoDB 문서 수 확인
echo "[6-1] Docker MongoDB 문서 수 확인"
DOCKER_COUNT=$(docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('${INTERNAL_DB_NAME}').materials.countDocuments()")
echo "  → Docker MongoDB: $DOCKER_COUNT개 문서"

# app 볼륨의 미리보기 파일 수 확인
echo "[6-2] app 볼륨 미리보기 파일 수 확인"
PREVIEW_COUNT=$(docker compose exec -T app sh -lc 'ls -1 /app/public/uploads/previews 2>/dev/null | wc -l')
echo "  → app 볼륨 미리보기: $PREVIEW_COUNT개"

echo ""
echo "========================================="
echo "  마이그레이션 완료!"
echo "========================================="
echo ""
echo "  문서: $DOCKER_COUNT개"
echo "  파일: $FILE_COUNT개"
echo "  미리보기: $PREVIEW_COUNT개"
echo ""
echo "  웹에서 확인하세요:"
echo "  - 자료 목록 페이지"
echo "  - 자료 상세 미리보기"
echo "  - 다운로드 테스트"
echo ""
