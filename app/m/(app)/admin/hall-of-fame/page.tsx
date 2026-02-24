import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import HallOfFameEntry from '@/lib/models/HallOfFameEntry';
import { PlusCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import EntryActions from './EntryActions';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  order_asc: { sortOrder: 1, updatedAt: -1, createdAt: -1 },
  order_desc: { sortOrder: -1, updatedAt: -1, createdAt: -1 },
  updated_desc: { updatedAt: -1, createdAt: -1 },
  updated_asc: { updatedAt: 1, createdAt: 1 },
};

const SORT_OPTIONS = [
  { value: 'order_asc', label: '노출순 ↑' },
  { value: 'order_desc', label: '노출순 ↓' },
  { value: 'updated_desc', label: '최근 수정순' },
  { value: 'updated_asc', label: '오래된 수정순' },
] as const;

type HallOfFameEntryLean = {
  _id: unknown;
  entryId?: string;
  kind?: 'admission' | 'review';
  isPublished?: boolean;
  sortOrder?: number;
  univ?: string;
  major?: string;
  student?: string;
  school?: string;
  badge?: string;
  desc?: string;
  name?: string;
  content?: string;
  tag?: string;
  stars?: number;
  updatedAt?: Date;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const formatUpdatedAt = (value: unknown) => {
  if (!value) return '-';
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default async function AdminHallOfFamePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;
  const q = normalizeText(sp.q);
  const kind = (sp.kind === 'admission' || sp.kind === 'review') ? sp.kind : '';
  const published = (sp.published === 'published' || sp.published === 'unpublished') ? sp.published : '';
  const sort = SORT_OPTIONS.some((opt) => opt.value === sp.sort) ? sp.sort : 'order_asc';
  const requestedPage = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 30;
  const hasFilter = Boolean(q || kind || published || sort !== 'order_asc');

  const filter: Record<string, unknown> = {};
  if (kind) filter.kind = kind;
  if (published === 'published') filter.isPublished = true;
  if (published === 'unpublished') filter.isPublished = false;
  if (q) {
    filter.$or = [
      { entryId: { $regex: q, $options: 'i' } },
      { univ: { $regex: q, $options: 'i' } },
      { major: { $regex: q, $options: 'i' } },
      { student: { $regex: q, $options: 'i' } },
      { desc: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { tag: { $regex: q, $options: 'i' } },
    ];
  }

  await connectMongo();
  const [totalAll, publishedCount, totalFiltered] = await Promise.all([
    HallOfFameEntry.countDocuments({}),
    HallOfFameEntry.countDocuments({ isPublished: true }),
    HallOfFameEntry.countDocuments(filter),
  ]);
  const totalPage = Math.max(1, Math.ceil(totalFiltered / limit));
  const page = Math.min(requestedPage, totalPage);

  const entries = await HallOfFameEntry.find(filter)
    .sort(SORT_MAP[sort] ?? SORT_MAP.order_asc)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean() as HallOfFameEntryLean[];

  const buildUrl = (overrides: Record<string, string>) => {
    const nextQ = overrides.q ?? q;
    const nextKind = overrides.kind ?? kind;
    const nextPublished = overrides.published ?? published;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? String(page);
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextKind) params.set('kind', nextKind);
    if (nextPublished) params.set('published', nextPublished);
    if (nextSort && nextSort !== 'order_asc') params.set('sort', nextSort);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);
    const qs = params.toString();
    return qs ? `/m/admin/hall-of-fame?${qs}` : '/m/admin/hall-of-fame';
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-6xl py-8 sm:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
                <span className="text-[13px] font-extrabold tracking-wide text-blue-500">관리자 패널</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2.25rem]">
                명예의 전당 관리
              </h1>
              <p className="mt-2 text-[15px] font-medium text-gray-400">
                총 <strong className="font-extrabold text-blue-500">{totalAll.toLocaleString()}</strong>개
                · 공개 <strong className="font-extrabold text-emerald-600">{publishedCount.toLocaleString()}</strong>개
                {hasFilter && (
                  <span className="ml-2 text-gray-500">
                    · 현재 <strong className="font-extrabold text-blue-500">{totalFiltered.toLocaleString()}</strong>개
                  </span>
                )}
              </p>
            </div>
            <Link
              href="/m/admin/hall-of-fame/new"
              className="m-detail-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[14px] md:w-auto md:shrink-0"
            >
              <PlusCircle size={18} />
              새 항목 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-6xl space-y-5 py-8">
        <div className="m-detail-card p-4 sm:p-5">
          <form action="/m/admin/hall-of-fame" method="get" className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="학교/학과/학생명/후기/이름 검색"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <div className="flex gap-2.5 sm:gap-3">
                <button type="submit" className="m-detail-btn-primary flex-1 rounded-2xl px-5 py-3 text-sm lg:flex-none">
                  필터 적용
                </button>
                {hasFilter && (
                  <Link
                    href="/m/admin/hall-of-fame"
                    className="m-detail-btn-secondary flex-1 rounded-2xl border border-gray-200 px-5 py-3 text-center text-sm lg:flex-none"
                  >
                    초기화
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <select
                name="kind"
                defaultValue={kind}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">유형 전체</option>
                <option value="admission">합격 사례</option>
                <option value="review">수강 후기</option>
              </select>

              <select
                name="published"
                defaultValue={published}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">노출 전체</option>
                <option value="published">공개</option>
                <option value="unpublished">비공개</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <input type="hidden" name="page" value="1" />
            </div>
          </form>
        </div>

        <div className="m-detail-card overflow-hidden">
          {entries.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm font-medium text-gray-500">
              조건에 맞는 항목이 없습니다.
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-white px-4 py-3 md:px-6">
                <p className="text-xs font-bold text-gray-500">
                  검색 결과 <span className="text-blue-500">{totalFiltered.toLocaleString()}</span>개
                </p>
              </div>

              <div className="hidden grid-cols-[170px_minmax(0,1fr)_112px_84px_170px_124px] items-center gap-4 border-b border-gray-100 bg-gray-50/80 px-6 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 md:grid">
                <div className="whitespace-nowrap">유형</div>
                <div className="whitespace-nowrap">내용</div>
                <div className="whitespace-nowrap">노출 상태</div>
                <div className="whitespace-nowrap">정렬</div>
                <div className="whitespace-nowrap">최근 수정</div>
                <div className="text-right">관리</div>
              </div>

              <div className="divide-y divide-gray-100">
                {entries.map((entry) => {
                  const entryId = entry.entryId || String(entry._id || '');
                  if (!entryId) return null;

                  const isAdmission = entry.kind === 'admission';
                  const title = isAdmission
                    ? `${normalizeText(entry.univ)} · ${normalizeText(entry.major)}`
                    : `${normalizeText(entry.name)}${normalizeText(entry.tag) ? ` · ${normalizeText(entry.tag)}` : ''}`;
                  const description = isAdmission
                    ? normalizeText(entry.desc)
                    : normalizeText(entry.content);

                  return (
                    <div key={entryId} className="grid gap-3 px-4 py-4 transition-colors hover:bg-blue-50/30 md:grid-cols-[170px_minmax(0,1fr)_112px_84px_170px_124px] md:items-center md:gap-4 md:px-6 md:py-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-700">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                          isAdmission
                            ? 'border border-blue-100 bg-blue-50 text-blue-600'
                            : 'border border-violet-100 bg-violet-50 text-violet-600'
                        }`}>
                          {isAdmission ? '합격 사례' : '수강 후기'}
                        </span>
                        {isAdmission && normalizeText(entry.badge) && (
                          <span className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                            {normalizeText(entry.badge)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold tracking-wide text-gray-400">#{entryId}</p>
                        <p className="truncate text-[15px] font-bold text-gray-900">{title || '(제목 없음)'}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-gray-500">{description || '-'}</p>
                      </div>

                      <div>
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                          entry.isPublished
                            ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border border-gray-200 bg-gray-50 text-gray-600'
                        }`}>
                          {entry.isPublished ? '공개' : '비공개'}
                        </span>
                      </div>

                      <div className="text-sm font-bold tabular-nums text-gray-700">{Number(entry.sortOrder || 0)}</div>
                      <div className="whitespace-nowrap text-xs font-medium tabular-nums text-gray-500">{formatUpdatedAt(entry.updatedAt)}</div>

                      <div className="md:justify-self-end">
                        <EntryActions entryId={entryId} isPublished={Boolean(entry.isPublished)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {totalPage > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={buildUrl({ page: String(Math.max(1, page - 1)) })}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${
                page <= 1
                  ? 'pointer-events-none border-gray-200 text-gray-300'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={16} />
              이전
            </Link>
            <span className="px-2 text-sm font-bold text-gray-600">
              {page} / {totalPage}
            </span>
            <Link
              href={buildUrl({ page: String(Math.min(totalPage, page + 1)) })}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${
                page >= totalPage
                  ? 'pointer-events-none border-gray-200 text-gray-300'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              다음
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
