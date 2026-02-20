'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft, BookOpen, Eye, Download, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Lock, ShoppingCart,
  FileText, School, Calendar, Users, RotateCcw, ShoppingBag,
  Shield, FileDown, RefreshCcw,
} from 'lucide-react';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  red:     'bg-red-100 text-red-700 border-red-200',
};

const diffBg: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  orange:  'bg-orange-100 text-orange-700',
  red:     'bg-red-100 text-red-700',
};

interface MaterialData {
  materialId:      string;
  type:            string;
  subject:         string;
  topic:           string;
  schoolLevel:     string;
  gradeNumber:     number;
  year:            number;
  semester:        number;
  period:          string;
  schoolName:      string;
  difficulty:      number;
  difficultyLabel: string;
  difficultyColor: string;
  isFree:          boolean;
  priceProblem:    number;
  priceEtc:        number;
  previewImages:   string[];
  viewCount:       number;
  downloadCount:   number;
  problemFile?:    string | null;
  etcFile?:        string | null;
}

interface RelatedMaterial {
  materialId:      string;
  subject:         string;
  topic:           string;
  type:            string;
  schoolName:      string;
  year:            number;
  gradeNumber:     number;
  semester:        number;
  difficulty:      number;
  difficultyLabel: string;
  difficultyColor: string;
  isFree:          boolean;
  priceProblem:    number;
  previewImages:   string[];
  downloadCount:   number;
}

export default function MaterialDetail({
  material,
  isLoggedIn,
  purchasedFileTypes = [],
  existingFeedback   = null,
  relatedMaterials   = [],
}: {
  material:             MaterialData;
  isLoggedIn:           boolean;
  purchasedFileTypes?:  string[];
  existingFeedback?:    { difficulty: string; ratingChange: number; newRating: number } | null;
  relatedMaterials?:    RelatedMaterial[];
}) {
  const showProblemOption = material.priceProblem > 0 || !!material.problemFile;
  const showEtcOption     = material.priceEtc     > 0 || !!material.etcFile;
  const [selectedFiles, setSelectedFiles] = useState<string[]>([
    ...(showProblemOption ? ['problem'] : []),
    ...(showEtcOption     ? ['etc']     : []),
  ]);
  const toggleFile = (t: string) =>
    setSelectedFiles((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const selectedAmount =
    (selectedFiles.includes('problem') ? material.priceProblem : 0) +
    (selectedFiles.includes('etc')     ? material.priceEtc     : 0);
  const purchaseUrl = selectedFiles.length > 0
    ? `/m/purchase/${material.materialId}?files=${selectedFiles.join(',')}`
    : `/m/purchase/${material.materialId}`;

  const [feedbackSent, setFeedbackSent]     = useState(!!existingFeedback);
  const [feedbackResult, setFeedbackResult] = useState<{ ratingChange: number; newRating: number } | null>(
    existingFeedback ? { ratingChange: existingFeedback.ratingChange, newRating: existingFeedback.newRating } : null
  );
  const [undoing,          setUndoing]          = useState(false);
  const [feedbackLoading,  setFeedbackLoading]  = useState(false);
  const [feedbackError,    setFeedbackError]    = useState('');
  const [activePreview, setActivePreview]   = useState(0);
  const [downloading,   setDownloading]     = useState<'problem' | 'etc' | null>(null);

  const handleDownload = async (type: 'problem' | 'etc') => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/m/download/${material.materialId}?type=${type}`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '다운로드 실패');
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const cd   = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename\*=UTF-8''([^;]+)/);
      a.href     = url;
      a.download = match ? decodeURIComponent(match[1]) : `${material.materialId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  const dc = material.difficultyColor;

  const sendFeedback = async (difficulty: 'easy' | 'normal' | 'hard') => {
    if (feedbackLoading) return;
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res  = await fetch('/api/m/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: material.materialId, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackResult({ ratingChange: data.ratingChange, newRating: data.newRating });
        setFeedbackSent(true);
      } else {
        setFeedbackError(data.error || '평가 실패');
      }
    } catch {
      setFeedbackError('네트워크 오류가 발생했습니다.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleUndo = async () => {
    setUndoing(true);
    setFeedbackError('');
    try {
      const res  = await fetch(`/api/m/feedback?materialId=${material.materialId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setFeedbackSent(false);
        setFeedbackResult(null);
      } else {
        setFeedbackError(data.error || '되돌리기 실패');
      }
    } catch {
      setFeedbackError('네트워크 오류가 발생했습니다.');
    } finally {
      setUndoing(false);
    }
  };

  const title = [
    material.schoolName,
    material.year        ? `${material.year}년`        : '',
    material.gradeNumber ? `${material.gradeNumber}학년` : '',
    material.semester    ? `${material.semester}학기`   : '',
    material.subject,
    material.topic,
  ].filter(Boolean).join(' ');

  const totalPrice = (material.priceProblem || 0) + (material.priceEtc || 0);

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-6 sm:py-8">
          <Link
            href="/m/materials"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-[var(--color-dre-blue)] transition-colors mb-5 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료 목록으로
          </Link>

          <div className="flex items-start gap-3 flex-wrap mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${diffStyle[dc] || diffStyle.blue}`}>
              {material.difficultyLabel}
            </span>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">{material.type}</span>
            {material.isFree && (
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">FREE</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dre-navy)] leading-tight mb-3">
            {title || material.subject}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Eye size={14} /> {material.viewCount ?? 0}회 조회</span>
            <span className="w-px h-3.5 bg-gray-200" />
            <span className="flex items-center gap-1.5"><Download size={14} /> {material.downloadCount ?? 0}회 다운로드</span>
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* ── 좌측: 미리보기 ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                {material.previewImages.length > 0 ? (
                  <>
                    <img
                      src={`/uploads/previews/${material.previewImages[activePreview]}`}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                    {!material.isFree && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-white" />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                      <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <p className="text-base text-gray-300 font-medium">미리보기 없음</p>
                  </div>
                )}
                {!material.isFree && material.previewImages.length > 0 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg border border-gray-100">
                      <Lock size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-600 font-semibold">구매 후 전체 열람 가능</span>
                    </div>
                  </div>
                )}
              </div>
              {material.previewImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto border-t border-gray-50">
                  {material.previewImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePreview(i)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        i === activePreview
                          ? 'border-[var(--color-dre-blue)] shadow-sm'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={`/uploads/previews/${img}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 우측: 정보 & 구매 ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* 자료 정보 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">자료 정보</p>
              <div className="space-y-0">
                {[
                  { icon: <FileText size={15} />, label: '과목', value: material.subject },
                  { icon: <BookOpen size={15} />, label: '단원', value: material.topic || '전체' },
                  { icon: <School size={15} />,   label: '학교', value: [material.schoolName, material.schoolLevel, material.gradeNumber ? `${material.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-' },
                  { icon: <Calendar size={15} />, label: '시험', value: [material.year ? `${material.year}년` : '', material.semester ? `${material.semester}학기` : ''].filter(Boolean).join(' ') || '-' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-gray-300 shrink-0">{icon}</span>
                    <span className="text-sm text-gray-400 w-10 shrink-0 font-medium">{label}</span>
                    <span className="text-base font-semibold text-gray-800 truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 구매 카드 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              {/* 소셜 프루프 */}
              {(material.downloadCount ?? 0) > 0 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                  <ShoppingBag size={14} className="text-[var(--color-dre-blue)] shrink-0" />
                  <p className="text-sm font-bold text-[var(--color-dre-blue)]">
                    {material.downloadCount.toLocaleString()}명이 구매했습니다
                  </p>
                </div>
              )}
              {material.isFree ? (
                /* ── 무료 자료 ── */
                <div className="space-y-3">
                  <p className="text-base text-gray-400 text-center font-medium">무료로 제공되는 자료입니다</p>
                  {material.problemFile && (
                    <button
                      onClick={() => handleDownload('problem')}
                      disabled={downloading === 'problem'}
                      className="w-full py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {downloading === 'problem' ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />다운로드 중...</> : <><Download size={18} />문제지 다운로드</>}
                    </button>
                  )}
                  {material.etcFile && (
                    <button
                      onClick={() => handleDownload('etc')}
                      disabled={downloading === 'etc'}
                      className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading === 'etc' ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />다운로드 중...</> : <><Download size={16} />답지 / 기타 다운로드</>}
                    </button>
                  )}
                  {!material.problemFile && !material.etcFile && (
                    <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                  )}
                </div>
              ) : purchasedFileTypes.length > 0 ? (
                /* ── 구매 완료 — 다운로드 버튼 ── */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <p className="text-base font-bold text-emerald-600">구매 완료</p>
                  </div>
                  {purchasedFileTypes.includes('problem') && material.problemFile && (
                    <button
                      onClick={() => handleDownload('problem')}
                      disabled={downloading === 'problem'}
                      className="w-full py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {downloading === 'problem' ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />다운로드 중...</> : <><Download size={18} />문제지 다운로드</>}
                    </button>
                  )}
                  {purchasedFileTypes.includes('etc') && material.etcFile && (
                    <button
                      onClick={() => handleDownload('etc')}
                      disabled={downloading === 'etc'}
                      className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading === 'etc' ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />다운로드 중...</> : <><Download size={16} />답지 / 기타 다운로드</>}
                    </button>
                  )}
                  {/* 구매했지만 아직 파일 미등록 */}
                  {purchasedFileTypes.includes('problem') && !material.problemFile && (
                    <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                  )}
                </div>
              ) : (
                /* ── 미구매 — 파일 선택 + 구매하기 ── */
                <>
                  {(showProblemOption || showEtcOption) && (
                    <div className="space-y-2 mb-5">
                      {showProblemOption && (
                        <label className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedFiles.includes('problem')
                            ? 'border-[var(--color-dre-blue)] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes('problem')}
                              onChange={() => toggleFile('problem')}
                              className="w-4 h-4 accent-[var(--color-dre-blue)]"
                            />
                            <span className="text-base font-semibold text-gray-800">문제지</span>
                          </div>
                          {material.priceProblem > 0
                            ? <span className="font-bold text-gray-900">{material.priceProblem.toLocaleString()}원</span>
                            : <span className="text-sm font-medium text-gray-400">포함</span>
                          }
                        </label>
                      )}
                      {showEtcOption && (
                        <label className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedFiles.includes('etc')
                            ? 'border-violet-400 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes('etc')}
                              onChange={() => toggleFile('etc')}
                              className="w-4 h-4 accent-violet-500"
                            />
                            <span className="text-base font-semibold text-gray-800">답지 / 기타</span>
                          </div>
                          {material.priceEtc > 0
                            ? <span className="font-bold text-gray-900">{material.priceEtc.toLocaleString()}원</span>
                            : <span className="text-sm font-medium text-gray-400">포함</span>
                          }
                        </label>
                      )}
                      {selectedAmount > 0 && (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-base font-bold text-gray-700">합계</span>
                          <span className="font-black text-[var(--color-dre-blue)] text-2xl">{selectedAmount.toLocaleString()}원</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    href={purchaseUrl}
                    className="w-full py-4 bg-[var(--color-dre-navy)] text-white font-bold rounded-2xl transition-all hover:shadow-xl hover:bg-[var(--color-dre-blue)] hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                  >
                    <ShoppingCart size={18} />
                    구매하기
                  </Link>
                  {/* 신뢰 배지 */}
                  <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400 font-medium flex-wrap">
                    <span className="flex items-center gap-1"><Shield size={11} className="text-emerald-500" />안전결제</span>
                    <span className="text-gray-200">·</span>
                    <span className="flex items-center gap-1"><FileDown size={11} className="text-[var(--color-dre-blue)]" />즉시 다운로드</span>
                    <span className="text-gray-200">·</span>
                    <span className="flex items-center gap-1"><RefreshCcw size={11} className="text-orange-400" />환불 정책</span>
                  </div>
                </>
              )}
            </div>

            {/* 난이도 피드백 — 구매(또는 무료)한 경우만 노출 */}
            {isLoggedIn && (material.isFree || purchasedFileTypes.length > 0) && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <p className="text-base font-bold text-gray-900 mb-1">학습 후 난이도 평가</p>
                <p className="text-sm text-gray-400 mb-5">ELO 레이팅에 반영됩니다</p>
                <AnimatePresence mode="wait">
                  {!feedbackSent ? (
                    <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'easy'   as const, label: '쉬웠어요',   icon: <TrendingUp size={20} />,   color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300' },
                          { val: 'normal' as const, label: '적당해요',   icon: <Minus size={20} />,         color: 'text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300' },
                          { val: 'hard'   as const, label: '어려웠어요', icon: <TrendingDown size={20} />,  color: 'text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300' },
                        ].map(({ val, label, icon, color }) => (
                          <button
                            key={val}
                            onClick={() => sendFeedback(val)}
                            disabled={feedbackLoading}
                            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed ${color}`}
                          >
                            {feedbackLoading ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
                            <span className="text-xs leading-tight text-center">{label}</span>
                          </button>
                        ))}
                      </div>
                      {feedbackError && (
                        <p className="text-xs text-red-500 font-medium text-center">{feedbackError}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <CheckCircle2 size={26} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-base font-bold text-emerald-700">피드백 완료!</p>
                          {feedbackResult && (
                            <p className="text-sm text-emerald-600 mt-0.5">
                              레이팅 {feedbackResult.ratingChange > 0 ? '+' : ''}{feedbackResult.ratingChange} → <strong>{feedbackResult.newRating}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleUndo}
                        disabled={undoing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all disabled:opacity-50"
                      >
                        <RotateCcw size={14} className={undoing ? 'animate-spin' : ''} />
                        {undoing ? '되돌리는 중...' : '평가 되돌리기'}
                      </button>
                      {feedbackError && (
                        <p className="text-xs text-red-500 font-medium text-center">{feedbackError}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── 관련 자료 섹션 ── */}
        {relatedMaterials.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[var(--color-dre-blue)] rounded-full" />
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                <h2 className="text-lg font-bold text-gray-900">이 자료를 구매한 사람들이 함께 구매한 자료</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedMaterials.map((r) => {
                const rTitle = [
                  r.schoolName,
                  r.year        ? `${r.year}년`        : '',
                  r.gradeNumber ? `${r.gradeNumber}학년` : '',
                  r.semester    ? `${r.semester}학기`   : '',
                  r.subject,
                  r.topic,
                ].filter(Boolean).join(' ');
                const rdc = r.difficultyColor;

                return (
                  <Link
                    key={r.materialId}
                    href={`/m/materials/${r.materialId}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-dre-blue)]/20 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center relative">
                      {r.previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${r.previewImages[0]}`}
                          alt={rTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen size={24} className="text-gray-200" />
                      )}
                      {r.isFree && (
                        <span className="absolute top-2 left-2 text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">FREE</span>
                      )}
                    </div>
                    <div className="p-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${diffBg[rdc] || diffBg.blue}`}>
                        {r.difficultyLabel}
                      </span>
                      <p className="text-sm font-bold text-gray-900 truncate leading-snug">{rTitle || r.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.subject}{r.topic ? ` · ${r.topic}` : ''}</p>
                      <p className="text-sm font-bold text-gray-700 mt-2">
                        {r.isFree ? (
                          <span className="text-emerald-500">무료</span>
                        ) : r.priceProblem > 0 ? (
                          `${r.priceProblem.toLocaleString()}원~`
                        ) : '가격 문의'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
