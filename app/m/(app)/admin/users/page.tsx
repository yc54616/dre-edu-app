import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { Users, ShieldCheck, GraduationCap, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import RegisterForm from './RegisterForm';
import UserActions from './UserActions';

const roleLabel: Record<string, string> = {
  admin: '관리자',
  teacher: '교사',
  student: '학생',
};

const roleStyle: Record<string, string> = {
  admin: 'bg-blue-50 text-blue-600 border-blue-100',
  teacher: 'bg-sky-50 text-sky-600 border-sky-100',
  student: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const approvalLabel: Record<string, string> = {
  approved: '승인 완료',
  pending: '승인 대기',
};

const approvalStyle: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
};

const emailVerifyLabel: Record<string, string> = {
  verified: '인증 완료',
  unverified: '미인증',
};

const emailVerifyStyle: Record<string, string> = {
  verified: 'bg-blue-50 text-blue-700 border-blue-100',
  unverified: 'bg-gray-50 text-gray-600 border-gray-200',
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name_asc: { username: 1 },
  name_desc: { username: -1 },
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신 가입순' },
  { value: 'oldest', label: '오래된 가입순' },
  { value: 'name_asc', label: '이름 오름차순' },
  { value: 'name_desc', label: '이름 내림차순' },
] as const;

const RoleIcon = ({ role }: { role: string }) => {
  if (role === 'admin') return <ShieldCheck size={11} />;
  if (role === 'teacher') return <GraduationCap size={11} />;
  return <BookOpen size={11} />;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const roleFilter = ['admin', 'teacher', 'student'].includes(sp.role || '') ? sp.role : '';
  const approvalFilter = ['approved', 'pending'].includes(sp.approval || '') ? sp.approval : '';
  const emailVerifiedFilter = ['verified', 'unverified'].includes(sp.emailVerified || '')
    ? sp.emailVerified
    : '';
  const sort = SORT_OPTIONS.some((opt) => opt.value === sp.sort) ? sp.sort : 'newest';
  const requestedPage = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 30;
  const hasFilter = !!(q || roleFilter || approvalFilter || emailVerifiedFilter || sort !== 'newest');

  const filter: Record<string, unknown> = {};
  if (roleFilter) filter.role = roleFilter;

  if (approvalFilter) {
    // 승인 상태는 교사 계정에만 적용
    if (!roleFilter || roleFilter === 'teacher') {
      filter.role = 'teacher';
      filter.teacherApprovalStatus = approvalFilter;
    }
  }

  if (emailVerifiedFilter) {
    filter.emailVerified = emailVerifiedFilter === 'verified';
  }

  if (q) {
    filter.$or = [
      { username: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

  await connectMongo();
  const [totalAll, groupedRoleCounts, pendingTeacherCount, totalFiltered] = await Promise.all([
    User.countDocuments({}),
    User.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'teacher', teacherApprovalStatus: 'pending' }),
    User.countDocuments(filter),
  ]);
  const totalPage = Math.max(1, Math.ceil(totalFiltered / limit));
  const page = Math.min(requestedPage, totalPage);
  const users = await User.find(filter)
    .select('-password')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const counts = { admin: 0, teacher: 0, student: 0, pendingTeacher: pendingTeacherCount };
  for (const c of groupedRoleCounts) {
    if (c._id in counts) counts[c._id as keyof typeof counts] = c.count;
  }

  const buildUrl = (overrides: Record<string, string>) => {
    const nextQ = overrides.q ?? q;
    const nextRole = overrides.role ?? roleFilter;
    const nextApproval = overrides.approval ?? approvalFilter;
    const nextEmailVerified = overrides.emailVerified ?? emailVerifiedFilter;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? String(page);

    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextRole) params.set('role', nextRole);
    if (nextApproval) params.set('approval', nextApproval);
    if (nextEmailVerified) params.set('emailVerified', nextEmailVerified);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);

    const qs = params.toString();
    return qs ? `/m/admin/users?${qs}` : '/m/admin/users';
  };

  return (
    <div className="m-detail-page min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[13px] font-extrabold text-blue-500 tracking-wide">관리자 패널</span>
          </div>
          <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">회원 관리</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-bold text-gray-500 sm:gap-3 sm:text-[14px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600">
              <Users size={14} />전체 {totalAll.toLocaleString()}명
            </span>
            {hasFilter && (
              <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sky-600">
                검색 {totalFiltered.toLocaleString()}명
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1">
              관리자 {counts.admin} / 교사 {counts.teacher} / 학생 {counts.student}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-amber-600">
              교사 승인 대기 {counts.pendingTeacher}
            </span>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-5xl py-8 space-y-6">
        {/* 계정 생성 */}
        <RegisterForm />

        {/* 필터 */}
        <div className="m-detail-card p-4 sm:p-5">
          <form action="/m/admin/users" method="get" className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="이름 또는 이메일 검색"
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="submit"
                className="m-detail-btn-primary w-full rounded-2xl px-5 py-2.5 text-sm sm:w-auto"
              >
                필터 적용
              </button>
              {hasFilter && (
                <Link
                  href="/m/admin/users"
                  className="m-detail-btn-secondary w-full border-gray-200 px-5 py-2.5 text-center text-sm sm:w-auto"
                >
                  초기화
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                name="role"
                defaultValue={roleFilter}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">역할 전체</option>
                <option value="admin">관리자</option>
                <option value="teacher">교사</option>
                <option value="student">학생</option>
              </select>

              <select
                name="approval"
                defaultValue={approvalFilter}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">교사 승인 전체</option>
                <option value="approved">승인 완료</option>
                <option value="pending">승인 대기</option>
              </select>

              <select
                name="emailVerified"
                defaultValue={emailVerifiedFilter}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">이메일 인증 전체</option>
                <option value="verified">인증 완료</option>
                <option value="unverified">미인증</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* 사용자 목록 */}
        {users.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
              <Users size={28} className="text-gray-300" />
            </div>
            <p className="text-[16px] font-bold text-gray-400">
              {hasFilter ? '조건에 맞는 회원이 없습니다' : '등록된 회원이 없습니다'}
            </p>
            {hasFilter && (
              <Link href="/m/admin/users" className="mt-4 text-[14px] text-blue-500 font-bold hover:underline underline-offset-4">
                필터 초기화
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {users.map((u) => {
                const verifyKey = u.emailVerified === false ? 'unverified' : 'verified';
                return (
                  <div key={String(u._id)} className="m-detail-card p-4 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{u.username}</p>
                      <p className="mt-0.5 text-xs text-gray-400 break-all">{u.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${roleStyle[u.role]}`}>
                        <RoleIcon role={u.role} />
                        {roleLabel[u.role] || u.role}
                      </span>
                      {u.role === 'teacher' ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${approvalStyle[u.teacherApprovalStatus || 'approved']}`}>
                          {approvalLabel[u.teacherApprovalStatus || 'approved']}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-400">승인 상태 없음</span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${emailVerifyStyle[verifyKey]}`}>
                        {emailVerifyLabel[verifyKey]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-500">
                        가입일 {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <UserActions
                        userId={String(u._id)}
                        username={u.username}
                        currentRole={u.role}
                        teacherApprovalStatus={u.teacherApprovalStatus || 'approved'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block">
              <div className="m-detail-card overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-7 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">회원</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">역할</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">승인 상태</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">이메일 인증</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">가입일</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const verifyKey = u.emailVerified === false ? 'unverified' : 'verified';
                      return (
                        <tr key={String(u._id)} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 text-sm">{u.username}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${roleStyle[u.role]}`}>
                              <RoleIcon role={u.role} />
                              {roleLabel[u.role] || u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {u.role === 'teacher' ? (
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${approvalStyle[u.teacherApprovalStatus || 'approved']}`}>
                                {approvalLabel[u.teacherApprovalStatus || 'approved']}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${emailVerifyStyle[verifyKey]}`}>
                              {emailVerifyLabel[verifyKey]}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <UserActions
                              userId={String(u._id)}
                              username={u.username}
                              currentRole={u.role}
                              teacherApprovalStatus={u.teacherApprovalStatus || 'approved'}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPage > 1 && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-400">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, totalFiltered)} / {totalFiltered.toLocaleString()}명
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors">
                      <ChevronLeft size={16} />
                    </Link>
                  )}
                  {Array.from({ length: totalPage }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPage)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-300 text-sm">…</span>
                        : <Link
                          key={p}
                          href={buildUrl({ page: String(p) })}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                            p === page
                              ? 'bg-blue-100 text-blue-600 border border-blue-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}
                        >
                          {p}
                        </Link>
                    )}
                  {page < totalPage && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
