'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MATERIAL_CURRICULUMS,
  MATERIAL_CURRICULUM_LABEL,
  MATERIAL_SUBJECTS_BY_CURRICULUM,
  MATERIAL_TYPES_BY_SOURCE,
  TOPIC_MAP,
  isSharedMaterialSubject,
  resolveMaterialCurriculumFromSubject,
  DIFFICULTY_LABEL,
  SCHOOL_LEVELS,
  MATERIAL_SOURCE_CATEGORY_LABEL,
  MAJOR_PUBLISHERS,
  type MaterialCurriculum,
} from '@/lib/constants/material';
import {
  FILE_TYPE_LABEL,
  TARGET_AUDIENCE_LABEL,
  MAX_PREVIEW_IMAGES,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { Save, Loader2, Upload, X, FileText, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface MaterialFormData {
  materialId?: string;
  curriculum: MaterialCurriculum;
  sourceCategory: MaterialSourceCategory;
  type: string;
  publisher: string;
  bookTitle: string;
  ebookDescription: string;
  ebookToc: string;
  subject: string;
  topic: string;
  schoolLevel: string;
  gradeNumber: number;
  year: number;
  semester: number;
  period: string;
  schoolName: string;
  regionSido: string;
  regionGugun: string;
  difficulty: number;
  difficultyRating: number;
  fileType: string;
  targetAudience: string;
  teacherProductType: string;
  teacherClassPrepType: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc: number;
  isActive?: boolean;
  problemFile?: string | null;
  hasAnswerInProblem?: boolean;
  etcFile?: string | null;
  previewImages?: string[];
}

const defaultForm: MaterialFormData = {
  curriculum: 'revised_2022',
  sourceCategory: 'school_exam',
  type: MATERIAL_TYPES_BY_SOURCE.school_exam[0],
  publisher: '',
  bookTitle: '',
  ebookDescription: '',
  ebookToc: '',
  subject: '',
  topic: '',
  schoolLevel: '고등학교',
  gradeNumber: 2,
  year: new Date().getFullYear(),
  semester: 1,
  period: '',
  schoolName: '',
  regionSido: '',
  regionGugun: '',
  difficulty: 3,
  difficultyRating: 1000,
  fileType: 'pdf',
  targetAudience: 'student',
  teacherProductType: '',
  teacherClassPrepType: '',
  isFree: false,
  priceProblem: 0,
  priceEtc: 0,
  isActive: true,
  problemFile: null,
  hasAnswerInProblem: false,
  etcFile: null,
  previewImages: [],
};

const SOURCE_OPTIONS = [
  { value: 'school_exam', label: MATERIAL_SOURCE_CATEGORY_LABEL.school_exam },
  { value: 'textbook', label: MATERIAL_SOURCE_CATEGORY_LABEL.textbook },
  { value: 'reference', label: MATERIAL_SOURCE_CATEGORY_LABEL.reference },
  { value: 'ebook', label: MATERIAL_SOURCE_CATEGORY_LABEL.ebook },
] as const;

const SCHOOL_NAME_REQUIRED_TYPES = new Set([
  '내신기출',
  '내신',
  '중간고사',
  '기말고사',
  '학교시험',
]);

export default function MaterialForm({
  mode,
  initialData,
  onFormChange,
}: {
  mode: 'create' | 'edit';
  initialData?: MaterialFormData;
  onFormChange?: (data: MaterialFormData) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<MaterialFormData>(initialData || defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingProblem, setUploadingProblem] = useState(false);
  const [uploadingEtc, setUploadingEtc] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<string>('');
  const [previewNoticeTone, setPreviewNoticeTone] = useState<'success' | 'warning'>('success');

  const parseJsonSafely = <T,>(raw: string): T | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const uploadFile = async (file: File, fileRole: 'problem' | 'etc' | 'preview') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileRole', fileRole);
    const res = await fetch('/api/m/admin/upload', { method: 'POST', body: fd });
    const data = await res.json() as { filename: string; previews?: string[]; previewWarning?: string };
    if (!res.ok) throw new Error((data as unknown as { error: string }).error || '업로드 실패');
    return data;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileRole: 'problem' | 'etc' | 'preview',
  ) => {
    // FileList는 live collection이므로 e.target.value='' 전에 배열로 복사
    const fileArray = Array.from(e.target.files ?? []);
    if (fileArray.length === 0) return;
    e.target.value = '';

    try {
      if (fileRole === 'preview') {
        const currentPreviews = form.previewImages || [];
        const remainingSlots = MAX_PREVIEW_IMAGES - currentPreviews.length;
        if (remainingSlots <= 0) {
          setPreviewNoticeTone('warning');
          setPreviewNotice(`미리보기는 최대 ${MAX_PREVIEW_IMAGES}장까지 등록할 수 있습니다.`);
          setTimeout(() => setPreviewNotice(''), 4000);
          return;
        }

        setUploadingPreview(true);
        const filenames: string[] = [];
        const uploadTargets = fileArray.slice(0, remainingSlots);
        for (const f of uploadTargets) {
          const res = await uploadFile(f, 'preview');
          filenames.push(res.filename);
        }
        const next = {
          ...form,
          previewImages: [...currentPreviews, ...filenames].slice(0, MAX_PREVIEW_IMAGES),
        };
        setForm(next);
        onFormChange?.(next);

        if (fileArray.length > remainingSlots) {
          setPreviewNoticeTone('warning');
          setPreviewNotice(`미리보기는 최대 ${MAX_PREVIEW_IMAGES}장까지 등록됩니다.`);
          setTimeout(() => setPreviewNotice(''), 4000);
        }
      } else {
        if (fileRole === 'problem') setUploadingProblem(true);
        else setUploadingEtc(true);
        const res = await uploadFile(fileArray[0], fileRole);
        let next = { ...form, [fileRole === 'problem' ? 'problemFile' : 'etcFile']: res.filename };

        // 자동 생성된 미리보기가 있고 현재 미리보기가 없을 때 자동 적용
        if (res.previews && res.previews.length > 0 && (form.previewImages || []).length === 0) {
          const autoPreviews = res.previews.slice(0, MAX_PREVIEW_IMAGES);
          next = { ...next, previewImages: autoPreviews };
          setPreviewNoticeTone('success');
          setPreviewNotice(`미리보기 ${autoPreviews.length}장 자동 생성됨`);
          setTimeout(() => setPreviewNotice(''), 5000);
        } else if (res.previewWarning) {
          setPreviewNoticeTone('warning');
          setPreviewNotice(res.previewWarning);
          setTimeout(() => setPreviewNotice(''), 6000);
        }

        setForm(next);
        onFormChange?.(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploadingProblem(false);
      setUploadingEtc(false);
      setUploadingPreview(false);
    }
  };

  const removePreview = (filename: string) => {
    const next = { ...form, previewImages: (form.previewImages || []).filter((f) => f !== filename) };
    setForm(next);
    onFormChange?.(next);
  };

  const isEbook = form.sourceCategory === 'ebook';
  const isSchoolExam = form.sourceCategory === 'school_exam';
  const typeOptions = MATERIAL_TYPES_BY_SOURCE[form.sourceCategory] || MATERIAL_TYPES_BY_SOURCE.school_exam;
  const curriculumSubjectOptionsBase = isEbook
    ? []
    : [...(MATERIAL_SUBJECTS_BY_CURRICULUM[form.curriculum] || [])];
  const subjectOptions = form.subject && !curriculumSubjectOptionsBase.includes(form.subject)
    ? [form.subject, ...curriculumSubjectOptionsBase]
    : curriculumSubjectOptionsBase;
  const topics = TOPIC_MAP[form.subject] || [];
  const schoolNameRequired = isSchoolExam && SCHOOL_NAME_REQUIRED_TYPES.has(form.type);
  const isTeacherMaterial = form.targetAudience === 'teacher';

  const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };

  const set = (key: keyof MaterialFormData, value: unknown) => {
    let next: MaterialFormData;
    if (key === 'sourceCategory') {
      const nextSource = value as MaterialSourceCategory;
      const nextTypeOptions = MATERIAL_TYPES_BY_SOURCE[nextSource] || MATERIAL_TYPES_BY_SOURCE.school_exam;
      const currentType = form.type;
      const nextType = nextTypeOptions.includes(currentType) ? currentType : (nextTypeOptions[0] || '');
      next = {
        ...form,
        sourceCategory: nextSource,
        type: nextType,
      };
      if (nextSource === 'ebook') {
        next = {
          ...next,
          curriculum: 'revised_2022',
          subject: '',
          schoolLevel: '',
          gradeNumber: 0,
          semester: 0,
          period: '',
          schoolName: '',
          regionSido: '',
          regionGugun: '',
        };
      } else if (form.sourceCategory === 'ebook') {
        next = {
          ...next,
          schoolLevel: form.schoolLevel || '고등학교',
          gradeNumber: form.gradeNumber > 0 ? form.gradeNumber : 2,
          semester: form.semester > 0 ? form.semester : 1,
        };
      }
    } else if (key === 'curriculum') {
      const nextCurriculum = value as MaterialCurriculum;
      const nextSubjectCandidates = MATERIAL_SUBJECTS_BY_CURRICULUM[nextCurriculum] || [];
      const canKeepSubject = !!form.subject && nextSubjectCandidates.includes(form.subject);
      next = {
        ...form,
        curriculum: nextCurriculum,
        subject: canKeepSubject ? form.subject : '',
        topic: canKeepSubject ? form.topic : '',
      };
    } else if (key === 'subject') {
      const nextSubject = value as string;
      const inferredCurriculum = isSharedMaterialSubject(nextSubject)
        ? form.curriculum
        : resolveMaterialCurriculumFromSubject(nextSubject);
      next = { ...form, subject: nextSubject, topic: '', curriculum: inferredCurriculum };
    } else if (key === 'isFree') {
      const nextIsFree = Boolean(value);
      next = {
        ...form,
        isFree: nextIsFree,
        ...(nextIsFree ? { priceProblem: 0, priceEtc: 0 } : {}),
      };
    } else if (key === 'priceProblem' || key === 'priceEtc') {
      const nextValue = Math.max(0, Number(value) || 0);
      next = {
        ...form,
        [key]: nextValue,
        ...(nextValue > 0 ? { isFree: false } : {}),
      };
    } else if (key === 'difficulty' && mode === 'create') {
      // 신규 등록 시에만 difficulty → difficultyRating 자동 매핑
      next = { ...form, difficulty: value as number, difficultyRating: RATING_MAP[value as number] || 1000 };
    } else {
      next = { ...form, [key]: value };
    }
    setForm(next);
    onFormChange?.(next);
  };

  const setFileType = (fileType: 'pdf' | 'hwp' | 'both') => {
    const next: MaterialFormData = {
      ...form,
      fileType,
      targetAudience:
        fileType === 'hwp' && form.targetAudience === 'student'
          ? 'teacher'
          : form.targetAudience,
    };
    setForm(next);
    onFormChange?.(next);

    if (fileType === 'hwp' && form.targetAudience === 'student') {
      setError('HWP 자료는 학생용으로 등록할 수 없어 대상을 교사용으로 변경했습니다.');
      return;
    }
    setError('');
  };

  const setTargetAudience = (targetAudience: 'student' | 'teacher' | 'all') => {
    if (targetAudience === 'student' && form.fileType === 'hwp') {
      setError('HWP 자료는 학생용으로 등록할 수 없습니다.');
      return;
    }
    const next: MaterialFormData = {
      ...form,
      targetAudience,
      teacherProductType: '',
      teacherClassPrepType: '',
    };
    setForm(next);
    onFormChange?.(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) {
      showFormError('유형은 필수입니다');
      return;
    }
    if (!isEbook && !form.subject) {
      showFormError('전자책을 제외한 자료는 과목이 필수입니다');
      return;
    }
    if (isEbook && !form.bookTitle.trim() && !form.topic.trim()) {
      showFormError('전자책은 도서명 또는 주제/키워드 중 하나는 입력해 주세요.');
      return;
    }
    if (schoolNameRequired && !form.schoolName.trim()) {
      showFormError('내신기출 자료는 학교명이 필수입니다.');
      return;
    }
    if (form.fileType === 'hwp' && form.targetAudience === 'student') {
      showFormError('HWP 자료는 학생용으로 등록할 수 없습니다.');
      return;
    }
    setSaving(true);
    setError('');

    const url = mode === 'create' ? '/api/m/materials' : `/api/m/materials/${form.materialId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          teacherProductType: '',
          teacherClassPrepType: '',
          problemFile: form.problemFile ?? null,
          hasAnswerInProblem: form.hasAnswerInProblem ?? false,
          etcFile: form.etcFile ?? null,
          previewImages: (form.previewImages ?? []).slice(0, MAX_PREVIEW_IMAGES),
        }),
      });

      const raw = await res.text();
      const data = parseJsonSafely<{ error?: string }>(raw);
      setSaving(false);

      if (!res.ok) {
        showFormError(data?.error || `저장 실패 (HTTP ${res.status})`);
        return;
      }

      router.push('/m/admin/materials');
      router.refresh();
    } catch (err) {
      setSaving(false);
      showFormError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    }
  };

  const audienceGuideText = (() => {
    if (isTeacherMaterial) {
      return '교사용 모드 전용 자료입니다.';
    }
    if (form.fileType === 'hwp') {
      if (form.targetAudience === 'teacher') {
        return '교사 모드에서만 표시됩니다 (HWP · 교사용)';
      }
      return 'HWP 자료는 학생용 단독 등록이 불가합니다 (전체/교사용만 허용)';
    }
    if (form.fileType === 'pdf' && form.targetAudience === 'student') {
      return '학생 모드에서만 표시됩니다 (PDF · 학생용)';
    }
    if (form.fileType === 'pdf' && form.targetAudience === 'teacher') {
      return 'PDF이지만 교사 모드에도 표시됩니다';
    }
    if (form.fileType === 'both' && form.targetAudience !== 'all') {
      return 'PDF + HWP 모두 제공되는 자료입니다';
    }
    if (form.targetAudience === 'all') {
      return '학생 모드와 교사 모드 모두에 표시됩니다';
    }
    return '학생 모드와 교사 모드 노출 대상을 정확히 설정하세요.';
  })();

  const showFormError = (message: string) => {
    setError(message);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-gray-900">기본 정보</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="자료 분류 *">
            <div className="flex gap-2">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('sourceCategory', opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.sourceCategory === opt.value
                      ? 'border-[var(--color-dre-blue)] bg-blue-50 text-[var(--color-dre-blue)]'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="유형 *">
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={selectClass} required>
              <option value="">선택</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          {!isEbook && (
            <FormField label="교육과정 *">
              <div className="flex gap-2">
                {MATERIAL_CURRICULUMS.map((curriculum) => (
                  <button
                    key={curriculum}
                    type="button"
                    onClick={() => set('curriculum', curriculum)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.curriculum === curriculum
                        ? 'border-[var(--color-dre-blue)] bg-blue-50 text-[var(--color-dre-blue)]'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    {MATERIAL_CURRICULUM_LABEL[curriculum]}
                  </button>
                ))}
              </div>
            </FormField>
          )}

          {!isEbook && (
            <FormField label="과목 *">
              <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className={selectClass} required>
                <option value="">선택</option>
                {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}

          <FormField label={isEbook ? '주제/키워드' : '단원'}>
            {!isEbook && topics.length > 0 ? (
              <select value={form.topic} onChange={(e) => set('topic', e.target.value)} className={selectClass}>
                <option value="">전체</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={form.topic}
                onChange={(e) => set('topic', e.target.value)}
                placeholder={isEbook ? '예: 고등수학 개념 입문' : '단원명'}
                className={inputClass}
              />
            )}
          </FormField>

          <FormField label="난이도">
            <select value={form.difficulty} onChange={(e) => set('difficulty', Number(e.target.value))} className={selectClass}>
              {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
            </select>
          </FormField>

          <FormField label="ELO 레이팅">
            <input
              type="number"
              value={form.difficultyRating}
              onChange={(e) => set('difficultyRating', Number(e.target.value))}
              className={inputClass}
              min={100}
              max={2000}
              step={50}
            />
          </FormField>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {isSchoolExam
            ? '내신기출은 학교/과목/유형 중심으로 분류됩니다.'
            : form.sourceCategory === 'ebook'
              ? '전자책은 주제/교재명 중심으로 분류됩니다.'
              : '교과서/참고서는 출판사/학교급/연도 중심으로 분류됩니다.'}
          {' '}ELO 레이팅은 학생 피드백에 따라 자동 조정됩니다.
        </p>
      </section>

      {/* 파일 형식 & 대상 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-gray-900">파일 형식 & 대상</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="파일 형식 *">
            <div className="flex gap-2">
              {(['pdf', 'hwp', 'both'] as const).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFileType(ft)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.fileType === ft
                      ? ft === 'hwp'
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-[var(--color-dre-blue)] bg-blue-50 text-[var(--color-dre-blue)]'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                >
                  {FILE_TYPE_LABEL[ft]}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="대상 *">
            <div className="flex gap-2">
              {(['student', 'teacher', 'all'] as const).map((ta) => (
                <button
                  key={ta}
                  type="button"
                  onClick={() => setTargetAudience(ta)}
                  disabled={ta === 'student' && form.fileType === 'hwp'}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${ta === 'student' && form.fileType === 'hwp'
                      ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                      : form.targetAudience === ta
                        ? ta === 'teacher'
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : ta === 'student'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                >
                  {TARGET_AUDIENCE_LABEL[ta]}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        <div className={`text-xs px-3 py-2 rounded-lg ${form.fileType === 'hwp' || form.targetAudience === 'teacher'
            ? 'bg-orange-50 text-orange-600'
            : 'bg-blue-50 text-[var(--color-dre-blue)]'
          }`}>
          {audienceGuideText}
        </div>
      </section>

      {/* 분류 상세 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-gray-900">
          {isSchoolExam ? '내신/시험 정보' : form.sourceCategory === 'ebook' ? '전자책 정보' : '교재 정보'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {!isSchoolExam && (
            <>
              <FormField label="출판사">
                <input
                  type="text"
                  value={form.publisher}
                  onChange={(e) => set('publisher', e.target.value)}
                  placeholder="예: 비상교육"
                  className={inputClass}
                  list="publisher-list"
                />
                <datalist id="publisher-list">
                  {MAJOR_PUBLISHERS.map((publisher) => <option key={publisher} value={publisher} />)}
                </datalist>
              </FormField>

              <FormField label={isEbook ? '도서명' : '교재명'}>
                <input
                  type="text"
                  value={form.bookTitle}
                  onChange={(e) => set('bookTitle', e.target.value)}
                  placeholder={isEbook ? '예: 초중선생님들을 위한 고등수학 가이드' : '예: 수학 I 교과서'}
                  className={inputClass}
                />
                {isEbook && (
                  <p className="mt-1 text-[11px] text-gray-400">도서명이 비어 있으면 주제/키워드를 제목으로 사용합니다.</p>
                )}
              </FormField>
            </>
          )}

          <FormField label={isSchoolExam ? '시험 연도' : '출간/적용 연도'}>
            <input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputClass} min={2000} max={2035} />
          </FormField>

          {isSchoolExam ? (
            <>
              <FormField label="학교급">
                <select value={form.schoolLevel} onChange={(e) => set('schoolLevel', e.target.value)} className={selectClass}>
                  {SCHOOL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="학년">
                <select value={form.gradeNumber} onChange={(e) => set('gradeNumber', Number(e.target.value))} className={selectClass}>
                  {[1, 2, 3].map((g) => <option key={g} value={g}>{g}학년</option>)}
                </select>
              </FormField>

              <FormField label="학기">
                <select value={form.semester} onChange={(e) => set('semester', Number(e.target.value))} className={selectClass}>
                  <option value={1}>1학기</option>
                  <option value={2}>2학기</option>
                </select>
              </FormField>

              <FormField label={schoolNameRequired ? '학교명 *' : '학교명'}>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => set('schoolName', e.target.value)}
                  placeholder="예: ○○고등학교"
                  className={inputClass}
                />
              </FormField>

              <FormField label="시험 범위/회차">
                <input
                  type="text"
                  value={form.period}
                  onChange={(e) => set('period', e.target.value)}
                  placeholder="예: 1학기 중간고사"
                  className={inputClass}
                />
              </FormField>

              <FormField label="시도">
                <input
                  type="text"
                  value={form.regionSido}
                  onChange={(e) => set('regionSido', e.target.value)}
                  placeholder="예: 서울특별시"
                  className={inputClass}
                />
              </FormField>

              <FormField label="시군구">
                <input
                  type="text"
                  value={form.regionGugun}
                  onChange={(e) => set('regionGugun', e.target.value)}
                  placeholder="예: 강남구"
                  className={inputClass}
                />
              </FormField>
            </>
          ) : isEbook ? (
            <>
              <div className="md:col-span-2">
                <FormField label="전자책 설명">
                  <textarea
                    value={form.ebookDescription}
                    onChange={(e) => set('ebookDescription', e.target.value)}
                    placeholder="책 소개, 활용 대상, 수업 적용 포인트를 입력해 주세요."
                    className={`${inputClass} min-h-[112px] resize-y`}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label="책 목차">
                  <textarea
                    value={form.ebookToc}
                    onChange={(e) => set('ebookToc', e.target.value)}
                    placeholder={`1. 기초 개념 정리\n2. 대표 유형 풀이\n3. 실전 적용`}
                    className={`${inputClass} min-h-[132px] resize-y`}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">한 줄에 한 항목씩 입력하면 상세 페이지에서 목록으로 표시됩니다.</p>
                </FormField>
              </div>
            </>
          ) : (
            <>
              <FormField label="학교급">
                <select value={form.schoolLevel} onChange={(e) => set('schoolLevel', e.target.value)} className={selectClass}>
                  {SCHOOL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="학년">
                <select value={form.gradeNumber} onChange={(e) => set('gradeNumber', Number(e.target.value))} className={selectClass}>
                  {[1, 2, 3].map((g) => <option key={g} value={g}>{g}학년</option>)}
                </select>
              </FormField>

              <FormField label="교육과정/시기">
                <input
                  type="text"
                  value={form.period}
                  onChange={(e) => set('period', e.target.value)}
                  placeholder="예: 2022 개정 교육과정"
                  className={inputClass}
                />
              </FormField>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {isSchoolExam
            ? '내신기출은 학교명과 시험 정보를 채우면 검색/분류 정확도가 올라갑니다.'
            : form.sourceCategory === 'ebook'
              ? '전자책은 교재명과 주제 정보를 중심으로 분류됩니다.'
              : '교과서/참고서는 출판사, 교재명, 학교급/연도 정보를 중심으로 분류됩니다.'}
        </p>
      </section>

      {/* 가격 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-gray-900">가격 설정</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('isFree', !form.isFree)}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.isFree ? 'bg-[var(--color-dre-blue)]' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${form.isFree ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">무료 자료</span>
        </label>

        {!form.isFree && (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="문제지 가격 (원)">
              <input type="number" value={form.priceProblem} onChange={(e) => set('priceProblem', Number(e.target.value))} className={inputClass} min={0} />
            </FormField>
            <FormField label="기타 가격 (원)">
              <input type="number" value={form.priceEtc} onChange={(e) => set('priceEtc', Number(e.target.value))} className={inputClass} min={0} />
            </FormField>
          </div>
        )}
      </section>

      {/* 파일 업로드 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-gray-900">파일 업로드</h2>

        {/* 문제 파일 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {isTeacherMaterial ? '자료 본문 파일 (PDF / HWP / HWPX)' : '문제 파일 (PDF / HWP / HWPX)'}
          </label>
          {form.problemFile ? (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <FileText size={16} className="text-[var(--color-dre-blue)] shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate flex-1">{form.problemFile}</span>
              <button type="button" onClick={() => { const n = { ...form, problemFile: null }; setForm(n); onFormChange?.(n); }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer transition-all ${uploadingProblem ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-[var(--color-dre-blue)]/50 hover:bg-gray-50'}`}>
              {uploadingProblem ? <Loader2 size={16} className="text-[var(--color-dre-blue)] animate-spin" /> : <Upload size={16} className="text-gray-400" />}
              <div className="flex-1">
                <span className="text-sm text-gray-500 font-medium">
                  {uploadingProblem ? '업로드 및 미리보기 생성 중...' : '파일 선택 (PDF, HWP, HWPX)'}
                </span>
                {uploadingProblem && (
                  <p className="text-[11px] text-blue-400 mt-0.5">HWP/HWPX는 변환에 10~30초가 소요될 수 있습니다</p>
                )}
              </div>
              <input type="file" accept=".pdf,.hwp,.hwpx" className="hidden" disabled={uploadingProblem} onChange={(e) => handleFileChange(e, 'problem')} />
            </label>
          )}
          {/* 정답 포함 토글 */}
          <div className="mt-3 flex items-center justify-between bg-gray-50/80 border border-gray-100/80 rounded-xl px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700">정답/해설 포함 자료</span>
              <span className="text-[11px] text-gray-500 mt-0.5">문제 파일 내에 정답이나 해설이 함께 들어있는 경우 체크해 주세요.</span>
            </div>
            <label className="flex items-center cursor-pointer ml-3">
              <div
                onClick={() => set('hasAnswerInProblem', !form.hasAnswerInProblem)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.hasAnswerInProblem ? 'bg-[var(--color-dre-blue)]' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${form.hasAnswerInProblem ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
        </div>

        {/* 기타 파일 (답지 등) */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {isTeacherMaterial
              ? '부가 자료 파일 (선택, PDF / HWP / HWPX)'
              : '기타 파일 (답지 / 해설 등, PDF / HWP / HWPX)'}
          </label>
          {form.etcFile ? (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <FileText size={16} className="text-violet-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate flex-1">{form.etcFile}</span>
              <button type="button" onClick={() => { const n = { ...form, etcFile: null }; setForm(n); onFormChange?.(n); }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer transition-all ${uploadingEtc ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-400/50 hover:bg-gray-50'}`}>
              {uploadingEtc ? <Loader2 size={16} className="text-violet-500 animate-spin" /> : <Upload size={16} className="text-gray-400" />}
              <div className="flex-1">
                <span className="text-sm text-gray-500 font-medium">
                  {uploadingEtc ? '업로드 및 미리보기 생성 중...' : '파일 선택 (PDF, HWP, HWPX)'}
                </span>
                {uploadingEtc && (
                  <p className="text-[11px] text-violet-400 mt-0.5">HWP/HWPX는 변환에 10~30초가 소요될 수 있습니다</p>
                )}
              </div>
              <input type="file" accept=".pdf,.hwp,.hwpx" className="hidden" disabled={uploadingEtc} onChange={(e) => handleFileChange(e, 'etc')} />
            </label>
          )}
        </div>

        {/* 미리보기 이미지 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-600">미리보기 이미지 (JPG, PNG, WEBP · 최대 2장)</label>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Sparkles size={10} className="text-blue-400" />
              PDF/HWP 업로드 시 자동 생성
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            현재 {(form.previewImages || []).length}/{MAX_PREVIEW_IMAGES}장
          </p>

          {/* 자동 생성 알림 */}
          {previewNotice && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3 ${previewNoticeTone === 'success'
                ? 'bg-emerald-50 border border-emerald-100'
                : 'bg-amber-50 border border-amber-100'
              }`}>
              {previewNoticeTone === 'success' ? (
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-amber-500 shrink-0" />
              )}
              <span className={`text-xs font-semibold ${previewNoticeTone === 'success' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {previewNotice}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {(form.previewImages || []).map((img) => (
              <div key={img} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <Image
                  src={`/uploads/previews/${img}`}
                  alt="미리보기 이미지"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(img)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            <label className={`w-20 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${uploadingPreview
                ? 'border-emerald-300 bg-emerald-50 cursor-wait'
                : (form.previewImages || []).length >= MAX_PREVIEW_IMAGES
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'cursor-pointer border-gray-200 hover:border-[var(--color-dre-blue)]/50 hover:bg-gray-50'
              }`}>
              {uploadingPreview ? <Loader2 size={16} className="text-emerald-500 animate-spin" /> : <ImageIcon size={16} className="text-gray-400" />}
              <span className="text-[10px] text-gray-400 font-medium text-center leading-tight px-1">
                {uploadingPreview ? '업로드 중' : (form.previewImages || []).length >= MAX_PREVIEW_IMAGES ? '최대\n2장' : '이미지\n추가'}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                disabled={uploadingPreview || (form.previewImages || []).length >= MAX_PREVIEW_IMAGES}
                onChange={(e) => handleFileChange(e, 'preview')}
              />
            </label>
          </div>
        </div>
      </section>

      {/* 공개 여부 (수정 시) */}
      {mode === 'edit' && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('isActive', !form.isActive)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">공개 여부</span>
          </label>
        </section>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border-2 border-gray-200 px-5 py-3 text-center font-semibold text-gray-600 transition-colors hover:border-gray-300 sm:w-auto"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-dre-blue)] text-white font-bold rounded-xl hover:bg-[var(--color-dre-blue-dark)] transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? '저장 중...' : mode === 'create' ? '자료 등록' : '수정 저장'}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[15px] text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/15 outline-none transition-all bg-white';
const selectClass = `${inputClass} cursor-pointer`;
