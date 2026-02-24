'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

export type HallOfFameFormData = {
  entryId?: string;
  kind: 'admission' | 'review';
  isPublished: boolean;
  sortOrder: number;
  univ: string;
  major: string;
  student: string;
  school: string;
  badge: string;
  desc: string;
  name: string;
  content: string;
  tag: string;
  stars: number;
};

const DEFAULT_FORM: HallOfFameFormData = {
  kind: 'admission',
  isPublished: true,
  sortOrder: 0,
  univ: '',
  major: '',
  student: '',
  school: '',
  badge: '수시 합격',
  desc: '',
  name: '',
  content: '',
  tag: '수강생',
  stars: 5,
};

interface Props {
  mode: 'create' | 'edit';
  initialData?: HallOfFameFormData;
}

export default function HallOfFameForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<HallOfFameFormData>({ ...DEFAULT_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmission = form.kind === 'admission';
  const title = mode === 'create' ? '명예의 전당 항목 등록' : '명예의 전당 항목 수정';
  const submitLabel = mode === 'create' ? '등록하기' : '저장하기';
  const endpoint = mode === 'create'
    ? '/api/m/admin/hall-of-fame'
    : `/api/m/admin/hall-of-fame/${form.entryId}`;
  const method = mode === 'create' ? 'POST' : 'PUT';

  const normalizedPayload = useMemo(
    () => ({
      kind: form.kind,
      isPublished: form.isPublished,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      univ: form.univ.trim(),
      major: form.major.trim(),
      student: form.student.trim(),
      school: form.school.trim(),
      badge: form.badge.trim(),
      desc: form.desc.trim(),
      name: form.name.trim(),
      content: form.content.trim(),
      tag: form.tag.trim(),
      stars: Math.max(1, Math.min(5, Math.round(form.stars || 5))),
    }),
    [form],
  );

  const validate = () => {
    if (isAdmission) {
      if (!normalizedPayload.univ || !normalizedPayload.major || !normalizedPayload.student || !normalizedPayload.desc) {
        setError('합격 사례는 학교, 학과, 학생명, 설명이 필수입니다.');
        return false;
      }
      return true;
    }

    if (!normalizedPayload.name || !normalizedPayload.content) {
      setError('수강 후기는 이름과 후기 본문이 필수입니다.');
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      });
      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(data.error || '저장에 실패했습니다.');
        setSaving(false);
        return;
      }
      router.push('/m/admin/hall-of-fame');
      router.refresh();
    } catch {
      setError('네트워크 오류로 저장하지 못했습니다.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="m-detail-card space-y-5 p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm font-medium text-gray-500">메인 사이트에서는 공개 항목만 노출됩니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">유형 *</label>
          <select
            value={form.kind}
            onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as 'admission' | 'review' }))}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="admission">합격 명예의 전당</option>
            <option value="review">생생 수강 후기</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">노출 순서</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value || '0', 10) || 0 }))}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {isAdmission ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">학교 *</label>
            <input
              type="text"
              value={form.univ}
              onChange={(e) => setForm((prev) => ({ ...prev, univ: e.target.value }))}
              placeholder="예: 서울대학교"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">학과 *</label>
            <input
              type="text"
              value={form.major}
              onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
              placeholder="예: 수학통계학부"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">학생명 *</label>
            <input
              type="text"
              value={form.student}
              onChange={(e) => setForm((prev) => ({ ...prev, student: e.target.value }))}
              placeholder="예: 강**"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">학생 정보</label>
            <input
              type="text"
              value={form.school}
              onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
              placeholder="예: 일반계고 · 내신 1.15"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">배지 문구</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="예: 수시 합격"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">합격 스토리 *</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))}
              rows={5}
              placeholder="예: 전교 1등을 줄곧 유지한 우수 학생..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">이름 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="예: 해바라기nn"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">태그</label>
            <input
              type="text"
              value={form.tag}
              onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
              placeholder="예: 학부모"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">별점</label>
            <select
              value={form.stars}
              onChange={(e) => setForm((prev) => ({ ...prev, stars: parseInt(e.target.value, 10) || 5 }))}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            >
              <option value={5}>5점</option>
              <option value={4}>4점</option>
              <option value={3}>3점</option>
              <option value={2}>2점</option>
              <option value={1}>1점</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">후기 본문 *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              rows={6}
              placeholder="예: 선생님께서 시험 대비 수준별..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-[var(--color-dre-blue)] focus:ring-[var(--color-dre-blue)]"
        />
        메인 사이트 공개
      </label>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={saving}
          className="m-detail-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? '저장 중...' : submitLabel}
        </button>
        <Link
          href="/m/admin/hall-of-fame"
          className="m-detail-btn-secondary inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm sm:w-auto"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
