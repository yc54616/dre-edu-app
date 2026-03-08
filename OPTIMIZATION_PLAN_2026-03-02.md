# DRE-EDU 최적화 실행 계획

- 작성일: 2026-03-02 (월)
- 시작 예정: 2026-03-03 (화)
- 대상: `/home/yc54616/workspace/2026 dre-edu/dre-edu-app`

## 1) 스캔 결과 요약

- `use client` 파일: 60개
- `framer-motion` 사용 파일: 29개
- `dynamic = 'force-dynamic'` 선언: 43개
- `$regex` 검색 사용 지점: 55개
- 업로드 데이터 용량:
  - `uploads/files`: 5,585 files / 약 1.8G
  - `public/uploads/previews`: 1,248 files / 약 136M

## 2) 핵심 병목

1. 빌드 시 파일 패턴 과대 매칭
   - `process.cwd()/uploads` 직접 참조로 Turbopack 경고 다수 발생
2. 이미지 최적화 비활성화
   - `next.config.ts`에서 `images.unoptimized: true`
3. 읽기 요청에서 쓰기/고비용 연산 수행
   - 자료 상세 조회 시 `viewCount 증가 + pageCount 계산/업데이트`
4. 주문 페이지 메모리 필터링
   - `my-orders`에서 사용자 주문 전체 조회 후 JS에서 정렬/필터
5. 검색 전반의 광범위 `$regex`
   - 자료/주문/유저/상담 관리자 화면에서 컬렉션 스캔 위험
6. 추천 로직 fan-out 쿼리
   - 여러 단계 조회 + 대량 배열 처리
7. 공개 페이지 강제 동적 렌더링
   - ISR 가능한 페이지까지 `force-dynamic`
8. 인덱스 보강 필요
   - 실제 조회 패턴 대비 `Order`, `User`, `Material` 인덱스 미흡

## 3) 우선순위 실행 플랜

## Phase 1 (빠른 효과: 1~2일)

1. 파일 저장 경로 외부화
   - `DRE_UPLOAD_DIR`, `DRE_PREVIEW_DIR` 도입
   - `uploads`/`public/uploads/previews`의 프로젝트 내부 직접 의존 제거
2. 빌드 경고 제거
   - 파일 경로 접근 유틸 통합
   - 빌드 시 대량 파일 패턴 매칭 방지
3. `my-orders` DB pushdown
   - 필터/정렬/페이징을 Mongo 쿼리로 이동
   - 메모리 처리 최소화

### Phase 2 (성능 안정화: 2~3일)

1. 읽기 경로에서 쓰기 제거
   - 상세 페이지의 카운트/페이지수 갱신을 비동기화(큐/배치)
2. 인덱스 보강
   - `Order`: `(userId, status, createdAt)`, `(materialId, status, createdAt)` 등
   - `User`: `(role, createdAt)`, `(emailVerified, role)` 등
   - `Material`: 목록/정렬/필터 패턴 기준 복합 인덱스 재설계
3. 검색 최적화
   - regex 입력 escape
   - prefix 검색 우선화
   - 필요 시 text index 또는 Atlas Search 검토

### Phase 3 (체감 개선: 2~4일)

1. 추천 로직 최적화
   - 집계 파이프라인 단순화
   - 사용자별 단기 캐시(예: 60~300초)
2. 공개 페이지 캐싱
   - `community`, `hall-of-fame`를 `revalidate` 기반 ISR로 전환
3. 번들 경량화
   - 대형 `use client` 파일 분리
   - 모달/고급 UI 동적 import
   - 과도한 `framer-motion` 구간 CSS 전환

### Phase 4 (운영 안정화)

1. 폰트 전략 개선
   - `next/font/google` 의존 완화(로컬 폰트/대체 폰트)
   - 네트워크 제한 환경에서도 빌드 안정화
2. 성능 회귀 방지
   - 빌드/응답 시간 기준선 측정
   - 변경 후 지표 비교 자동화

## 4) 첫 작업 체크리스트 (내일 시작용)

- [ ] `DRE_UPLOAD_DIR`, `DRE_PREVIEW_DIR` 환경변수 설계
- [ ] 파일 경로 참조 코드 일괄 교체
- [ ] `my-orders` 쿼리 pushdown 리팩터링
- [ ] 주요 인덱스 후보 정리 + `explain()` 측정
- [ ] `community`, `hall-of-fame` 캐시 정책 변경안 작성
- [ ] 추천 로직 쿼리 수/시간 측정 포인트 추가

## 5) 완료 기준 (Definition of Done)

- 빌드 시 파일 패턴 과대 매칭 경고 제거
- `my-orders` 응답시간/메모리 사용량 개선 확인
- 관리자 주요 검색/목록 쿼리 `explain()`에서 인덱스 사용 확인
- 공개 페이지 캐시 적용 후 서버 부담 감소 확인
- 추천 페이지 첫 응답 시간 단축 확인
