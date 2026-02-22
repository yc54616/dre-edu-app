import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen, ShoppingBag, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  isTeacher: boolean;
  totalMaterials: number;
  totalPurchaseCount: number;
}

export default function MaterialHero({ isTeacher, totalMaterials, totalPurchaseCount }: Props) {
  return (
    <section className="m-surface-card relative overflow-hidden rounded-[2rem] px-6 py-7 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl" />

      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
            <span className={`m-dot h-2 w-2 rounded-full ${isTeacher ? 'bg-amber-500' : 'bg-blue-500'}`} />
            {isTeacher ? 'Teacher Mode' : 'Student Mode'}
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-[2.55rem]">
            DRE M
            <span className="m-title-gradient ml-2">프리미엄 자료 스토어</span>
          </h1>

          <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-500">
            DRE 메인 사이트의 브랜드 톤을 유지한 스토어입니다. 검수된 자료를 빠르게 탐색하고,
            구매까지 직관적으로 이어지는 전환 중심 동선으로 구성했습니다.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="전체 자료" value={`${totalMaterials.toLocaleString()}개`} note="검수 완료 큐레이션" />
            <StatCard label="누적 구매" value={`${totalPurchaseCount.toLocaleString()}건`} note="실사용 기반 인기 데이터" />
            <StatCard label="전용 포맷" value={isTeacher ? 'HWP 중심' : 'PDF 중심'} note={isTeacher ? '교사 수업용 자료' : '학생 학습용 자료'} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="m-gradient-badge rounded-3xl p-5 shadow-[0_20px_34px_-22px_rgba(37,99,235,.9)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-100/95">전환 추천</p>
                <p className="mt-2 text-xl font-black leading-tight">ELO 맞춤 추천</p>
                <p className="mt-2 text-sm font-semibold text-blue-100/90">
                  현재 실력에 맞는 자료를 빠르게 탐색하고 구매하세요.
                </p>
              </div>
              <Sparkles className="mt-1" size={21} />
            </div>
            <Link
              href="/m/recommend"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/25"
            >
              추천 보기
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MiniCard
              icon={<BookOpen size={17} />}
              title="학교/단원 기준 탐색"
              desc="찾고 싶은 자료를 빠르게 발견"
            />
            <MiniCard
              icon={<ShoppingBag size={17} />}
              title="결제 후 즉시 이용"
              desc="구매 직후 다운로드 가능"
            />
            <MiniCard
              icon={<BadgeCheck size={17} />}
              title="DRE 기준 검수"
              desc="품질 기준 통과 자료만 제공"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="m-surface-soft p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function MiniCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="m-surface-soft flex items-center gap-3 p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </span>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs font-semibold text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
