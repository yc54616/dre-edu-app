'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MATERIAL_SUBJECTS, MATERIAL_TYPES, TOPIC_MAP, DIFFICULTY_LABEL, SCHOOL_LEVELS } from '@/lib/constants/material';
import { FILE_TYPE_LABEL, TARGET_AUDIENCE_LABEL } from '@/lib/constants/material';
import { Save, Loader2, Upload, X, FileText, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface MaterialFormData {
  materialId?:     string;
  type:            string;
  subject:         string;
  topic:           string;
  schoolLevel:     string;
  gradeNumber:     number;
  year:            number;
  semester:        number;
  period:          string;
  schoolName:      string;
  regionSido:      string;
  regionGugun:     string;
  difficulty:      number;
  difficultyRating:number;
  fileType:        string;
  targetAudience:  string;
  isFree:          boolean;
  priceProblem:    number;
  priceEtc:        number;
  isActive?:       boolean;
  problemFile?:    string | null;
  etcFile?:        string | null;
  previewImages?:  string[];
}

const defaultForm: MaterialFormData = {
  type:           '',
  subject:        '',
  topic:          '',
  schoolLevel:    '고등학교',
  gradeNumber:    2,
  year:           new Date().getFullYear(),
  semester:       1,
  period:         '',
  schoolName:     '',
  regionSido:     '',
  regionGugun:    '',
  difficulty:     3,
  difficultyRating: 1000,
  fileType:       'pdf',
  targetAudience: 'student',
  isFree:         false,
  priceProblem:   0,
  priceEtc:       0,
  isActive:       true,
  problemFile:    null,
  etcFile:        null,
  previewImages:  [],
};

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
  const [saving,           setSaving]           = useState(false);
  const [error,            setError]            = useState('');
  const [uploadingProblem, setUploadingProblem] = useState(false);
  const [uploadingEtc,     setUploadingEtc]     = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewNotice,    setPreviewNotice]    = useState<string>('');

  const uploadFile = async (file: File, fileRole: 'problem' | 'etc' | 'preview') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileRole', fileRole);
    const res  = await fetch('/api/m/admin/upload', { method: 'POST', body: fd });
    const data = await res.json() as { filename: string; previews?: string[] };
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
        setUploadingPreview(true);
        const filenames: string[] = [];
        for (const f of fileArray) {
          const res = await uploadFile(f, 'preview');
          filenames.push(res.filename);
        }
        const next = { ...form, previewImages: [...(form.previewImages || []), ...filenames] };
        setForm(next);
        onFormChange?.(next);
      } else {
        if (fileRole === 'problem') setUploadingProblem(true);
        else setUploadingEtc(true);
        const res  = await uploadFile(fileArray[0], fileRole);
        let next   = { ...form, [fileRole === 'problem' ? 'problemFile' : 'etcFile']: res.filename };

        // 자동 생성된 미리보기가 있고 현재 미리보기가 없을 때 자동 적용
        if (res.previews && res.previews.length > 0 && (form.previewImages || []).length === 0) {
          next = { ...next, previewImages: res.previews };
          setPreviewNotice(`미리보기 ${res.previews.length}장 자동 생성됨`);
          setTimeout(() => setPreviewNotice(''), 5000);
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

  const topics = TOPIC_MAP[form.subject] || [];

  const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };

  const set = (key: keyof MaterialFormData, value: unknown) => {
    let next: MaterialFormData;
    if (key === 'subject') {
      next = { ...form, subject: value as string, topic: '' };
    } else if (key === 'difficulty' && mode === 'create') {
      // 신규 등록 시에만 difficulty → difficultyRating 자동 매핑
      next = { ...form, difficulty: value as number, difficultyRating: RATING_MAP[value as number] || 1000 };
    } else {
      next = { ...form, [key]: value };
    }
    setForm(next);
    onFormChange?.(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.subject) { setError('유형과 과목은 필수입니다'); return; }

    setSaving(true);
    setError('');

    const url    = mode === 'create' ? '/api/m/materials' : `/api/m/materials/${form.materialId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        problemFile:   form.problemFile   ?? null,
        etcFile:       form.etcFile       ?? null,
        previewImages: form.previewImages ?? [],
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || '저장 실패');
    } else {
      router.push('/m/admin/materials');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900">기본 정보</h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="유형 *">
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={selectClass} required>
              <option value="">선택</option>
              {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField label="과목 *">
            <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className={selectClass} required>
              <option value="">선택</option>
              {MATERIAL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="단원">
            {topics.length > 0 ? (
              <select value={form.topic} onChange={(e) => set('topic', e.target.value)} className={selectClass}>
                <option value="">전체</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <input type="text" value={form.topic} onChange={(e) => set('topic', e.target.value)} placeholder="단원명" className={inputClass} />
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
          ELO 레이팅은 학생 피드백에 따라 자동 조정됩니다. 초기값은 난이도 선택 시 자동으로 채워집니다.
        </p>
      </section>

      {/* 파일 형식 & 대상 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900">파일 형식 & 대상</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="파일 형식 *">
            <div className="flex gap-2">
              {(['pdf', 'hwp', 'both'] as const).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => set('fileType', ft)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.fileType === ft
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
                  onClick={() => set('targetAudience', ta)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.targetAudience === ta
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

        <div className={`text-xs px-3 py-2 rounded-lg ${
          form.fileType === 'hwp' || form.targetAudience === 'teacher'
            ? 'bg-orange-50 text-orange-600'
            : 'bg-blue-50 text-[var(--color-dre-blue)]'
        }`}>
          {form.fileType === 'hwp' && form.targetAudience === 'teacher' && '교사 모드에서만 표시됩니다 (HWP · 교사용)'}
          {form.fileType === 'pdf'  && form.targetAudience === 'student' && '학생 모드에서만 표시됩니다 (PDF · 학생용)'}
          {form.targetAudience === 'all' && '학생 모드와 교사 모드 모두에 표시됩니다'}
          {form.fileType === 'both' && form.targetAudience !== 'all' && 'PDF + HWP 모두 제공되는 자료입니다'}
          {form.fileType === 'hwp' && form.targetAudience === 'student' && 'HWP이지만 학생 모드에도 표시됩니다'}
          {form.fileType === 'pdf'  && form.targetAudience === 'teacher' && 'PDF이지만 교사 모드에도 표시됩니다'}
        </div>
      </section>

      {/* 학교 정보 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900">학교 정보</h2>
        <div className="grid grid-cols-2 gap-4">
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

          <FormField label="연도">
            <input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputClass} min={2000} max={2030} />
          </FormField>

          <FormField label="학기">
            <select value={form.semester} onChange={(e) => set('semester', Number(e.target.value))} className={selectClass}>
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </select>
          </FormField>

          <FormField label="학교명">
            <input type="text" value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} placeholder="○○고등학교" className={inputClass} />
          </FormField>

          <FormField label="시도">
            <input type="text" value={form.regionSido} onChange={(e) => set('regionSido', e.target.value)} placeholder="서울특별시" className={inputClass} />
          </FormField>
        </div>
      </section>

      {/* 가격 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">가격 설정</h2>
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
          <div className="grid grid-cols-2 gap-4">
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
        <h2 className="font-bold text-gray-900">파일 업로드</h2>

        {/* 문제 파일 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">문제 파일 (PDF / HWP)</label>
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
                  {uploadingProblem ? '업로드 및 미리보기 생성 중...' : '파일 선택 (PDF, HWP)'}
                </span>
                {uploadingProblem && (
                  <p className="text-[11px] text-blue-400 mt-0.5">HWP는 변환에 10~30초가 소요될 수 있습니다</p>
                )}
              </div>
              <input type="file" accept=".pdf,.hwp" className="hidden" disabled={uploadingProblem} onChange={(e) => handleFileChange(e, 'problem')} />
            </label>
          )}
        </div>

        {/* 기타 파일 (답지 등) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">기타 파일 (답지 / 해설 등, PDF / HWP)</label>
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
                  {uploadingEtc ? '업로드 및 미리보기 생성 중...' : '파일 선택 (PDF, HWP)'}
                </span>
                {uploadingEtc && (
                  <p className="text-[11px] text-violet-400 mt-0.5">HWP는 변환에 10~30초가 소요될 수 있습니다</p>
                )}
              </div>
              <input type="file" accept=".pdf,.hwp" className="hidden" disabled={uploadingEtc} onChange={(e) => handleFileChange(e, 'etc')} />
            </label>
          )}
        </div>

        {/* 미리보기 이미지 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-500">미리보기 이미지 (JPG, PNG, WEBP · 복수 선택 가능)</label>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Sparkles size={10} className="text-blue-400" />
              PDF/HWP 업로드 시 자동 생성
            </span>
          </div>

          {/* 자동 생성 알림 */}
          {previewNotice && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 mb-3">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-emerald-700">{previewNotice}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {(form.previewImages || []).map((img) => (
              <div key={img} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={`/uploads/previews/${img}`} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(img)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            <label className={`w-20 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${uploadingPreview ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-[var(--color-dre-blue)]/50 hover:bg-gray-50'}`}>
              {uploadingPreview ? <Loader2 size={16} className="text-emerald-500 animate-spin" /> : <ImageIcon size={16} className="text-gray-400" />}
              <span className="text-[10px] text-gray-400 font-medium text-center leading-tight px-1">{uploadingPreview ? '업로드 중' : '이미지\n추가'}</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" disabled={uploadingPreview} onChange={(e) => handleFileChange(e, 'preview')} />
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-colors"
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
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass  = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white';
const selectClass = `${inputClass} cursor-pointer`;
