'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, RefreshCw, Users } from 'lucide-react';

export default function ModeToggleButton({
  currentMode,
}: {
  currentMode: 'teacher' | 'student';
}) {
  const router = useRouter();
  const nextMode = currentMode === 'teacher' ? 'student' : 'teacher';
  const nextLabel = currentMode === 'teacher' ? '학생용 보기로 전환' : '교사용 보기로 전환';
  const Icon = currentMode === 'teacher' ? GraduationCap : Users;

  const handleToggle = () => {
    document.cookie = `dre-mode=${nextMode}; path=/; max-age=86400`;
    router.push('/m/materials');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-[14px] font-extrabold text-blue-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 sm:text-[15px]"
    >
      <Icon size={15} className="shrink-0 text-blue-500" />
      <span className="truncate">{nextLabel}</span>
      <RefreshCw size={14} className="shrink-0 text-blue-400" />
    </button>
  );
}
