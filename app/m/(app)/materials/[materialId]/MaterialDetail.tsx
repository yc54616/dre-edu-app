'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, BookOpen, ShoppingBag, Download, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Lock, ShoppingCart,
  FileText, School, Calendar, Users, RotateCcw,
} from 'lucide-react';

const diffStyle: Record<string, string> = {
  emerald: 'bg-blue-50 text-blue-600 border-blue-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  violet: 'bg-sky-50 text-sky-700 border-sky-200',
  orange: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  red: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface MaterialData {
  materialId: string;
  type: string;
  subject: string;
  topic: string;
  schoolLevel: string;
  gradeNumber: number;
  year: number;
  semester: number;
  period: string;
  schoolName: string;
  difficulty: number;
  difficultyLabel: string;
  difficultyColor: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc: number;
  previewImages: string[];
  viewCount: number;
  downloadCount: number;
  problemFile?: string | null;
  etcFile?: string | null;
}

interface RelatedMaterial {
  materialId: string;
  subject: string;
  topic: string;
  type: string;
  schoolName: string;
  year: number;
  gradeNumber: number;
  semester: number;
  difficulty: number;
  difficultyLabel: string;
  difficultyColor: string;
  isFree: boolean;
  priceProblem: number;
  previewImages: string[];
  downloadCount: number;
}

export default function MaterialDetail({
  material,
  isLoggedIn,
  purchasedFileTypes = [],
  existingFeedback = null,
  relatedMaterials = [],
}: {
  material: MaterialData;
  isLoggedIn: boolean;
  purchasedFileTypes?: string[];
  existingFeedback?: { difficulty: string; ratingChange: number; newRating: number } | null;
  relatedMaterials?: RelatedMaterial[];
}) {
  const showProblemOption = material.priceProblem > 0 || !!material.problemFile;
  const showEtcOption = material.priceEtc > 0 || !!material.etcFile;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFiles] = useState<string[]>([
    ...(showProblemOption ? ['problem'] : []),
    ...(showEtcOption ? ['etc'] : []),
  ]);
  const selectedAmount =
    (selectedFiles.includes('problem') ? material.priceProblem : 0) +
    (selectedFiles.includes('etc') ? material.priceEtc : 0);
  const purchaseUrl = selectedFiles.length > 0
    ? `/m/purchase/${material.materialId}?files=${selectedFiles.join(',')}`
    : `/m/purchase/${material.materialId}`;

  const [feedbackSent, setFeedbackSent] = useState(!!existingFeedback);
  const [feedbackResult, setFeedbackResult] = useState<{ ratingChange: number; newRating: number } | null>(
    existingFeedback ? { ratingChange: existingFeedback.ratingChange, newRating: existingFeedback.newRating } : null
  );
  const [undoing, setUndoing] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [activePreview, setActivePreview] = useState(0);
  const [downloading, setDownloading] = useState<'problem' | 'etc' | null>(null);

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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename\*=UTF-8''([^;]+)/);
      a.href = url;
      a.download = match ? decodeURIComponent(match[1]) : `${material.materialId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  const dc = material.difficultyColor;
  const handleBackToList = () => {
    const from = searchParams.get('from');
    if (from) {
      router.push(from);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/m/materials');
  };

  const sendFeedback = async (difficulty: 'easy' | 'normal' | 'hard') => {
    if (feedbackLoading) return;
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await fetch('/api/m/feedback', {
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
      const res = await fetch(`/api/m/feedback?materialId=${material.materialId}`, { method: 'DELETE' });
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
    material.year ? `${material.year}년` : '',
    material.gradeNumber ? `${material.gradeNumber}학년` : '',
    material.semester ? `${material.semester}학기` : '',
    material.subject,
    material.topic,
  ].filter(Boolean).join(' ');

  return (
    <div className="m-detail-page min-h-screen">

      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-6 sm:py-8">
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-500 hover:text-blue-500 transition-colors mb-5 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료 목록으로
          </button>

          <div className="flex items-start gap-3 flex-wrap mb-4">
            <span className={`text-[12px] font-extrabold px-3.5 py-1.5 rounded-full border ${diffStyle[dc] || diffStyle.blue}`}>
              {material.difficultyLabel}
            </span>
            <span className="text-[12px] text-gray-500 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full font-bold">{material.type}</span>
            {material.isFree && (
              <span className="text-[12px] font-extrabold text-blue-600 bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-full">FREE</span>
            )}
          </div>

          <h1 className="m-detail-title mb-4">
            {title || material.subject}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><ShoppingBag size={14} /> {material.downloadCount ?? 0}명 구매</span>
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="m-detail-container max-w-5xl py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* ── 좌측: 미리보기 ── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="m-detail-card overflow-hidden p-2">
              <div className="relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden">
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
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <p className="text-base text-gray-300 font-medium">미리보기 없음</p>
                  </div>
                )}
                {!material.isFree && material.previewImages.length > 0 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-2.5 shadow-lg border border-gray-100">
                      <Lock size={14} className="text-gray-500" />
                      <span className="text-[13px] text-gray-700 font-bold">구매 후 전체 열람 가능</span>
                    </div>
                  </div>
                )}
              </div>
              {material.previewImages.length > 1 && (
                <div className="flex gap-2.5 p-3 overflow-x-auto">
                  {material.previewImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePreview(i)}
                      className={`w-[4.5rem] h-[6rem] rounded-xl overflow-hidden border-[3px] shrink-0 transition-all duration-200 ${i === activePreview
                          ? 'border-blue-300 shadow-sm shadow-blue-100'
                          : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
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
            <div className="m-detail-card p-6">
              <p className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <FileText size={14} /> 자료 상세 정보
              </p>
              <div className="space-y-0">
                {[
                  { icon: <FileText size={15} />, label: '과목', value: material.subject },
                  { icon: <BookOpen size={15} />, label: '단원', value: material.topic || '전체' },
                  {
                    icon: <School size={15} />, label: '학교',
                    value: [material.schoolName, material.schoolLevel, material.gradeNumber ? `${material.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-'
                  },
                  {
                    icon: <Calendar size={15} />, label: '시험',
                    value: [material.year ? `${material.year}년` : '', material.semester ? `${material.semester}학기` : ''].filter(Boolean).join(' ') || '-'
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 shrink-0 bg-gray-50 p-2 rounded-xl">{icon}</span>
                    <span className="text-[13px] text-gray-500 w-12 shrink-0 font-extrabold">{label}</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 구매 카드 */}
            <div className="m-detail-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60" />

              {/* 소셜 프루프 */}
              {(material.downloadCount ?? 0) > 0 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                  <ShoppingBag size={14} className="text-blue-500 shrink-0" />
                  <p className="text-sm font-semibold text-blue-600">
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
                      className="m-detail-btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {downloading === 'problem'
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                        : <><Download size={18} />문제지 다운로드</>
                      }
                    </button>
                  )}
                  {material.etcFile && (
                    <button
                      onClick={() => handleDownload('etc')}
                      disabled={downloading === 'etc'}
                      className="m-detail-btn-secondary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading === 'etc'
                        ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                        : <><Download size={16} />답지 / 기타 다운로드</>
                      }
                    </button>
                  )}
                  {!material.problemFile && !material.etcFile && (
                    <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                  )}
                </div>
              ) : purchasedFileTypes.length > 0 ? (
                /* ── 구매 완료 ── */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="text-blue-400" />
                    <p className="text-base font-semibold text-blue-600">구매 완료</p>
                  </div>
                  {purchasedFileTypes.includes('problem') && material.problemFile && (
                    <button
                      onClick={() => handleDownload('problem')}
                      disabled={downloading === 'problem'}
                      className="m-detail-btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {downloading === 'problem'
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                        : <><Download size={18} />문제지 다운로드</>
                      }
                    </button>
                  )}
                  {purchasedFileTypes.includes('etc') && material.etcFile && (
                    <button
                      onClick={() => handleDownload('etc')}
                      disabled={downloading === 'etc'}
                      className="m-detail-btn-secondary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading === 'etc'
                        ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                        : <><Download size={16} />답지 / 기타 다운로드</>
                      }
                    </button>
                  )}
                  {purchasedFileTypes.includes('problem') && !material.problemFile && (
                    <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                  )}
                </div>
              ) : (
                /* ── 미구매 ── */
                <>
                  {(showProblemOption || showEtcOption) && (
                    <div className="space-y-3 mb-5 relative z-10">
                      {showProblemOption && (
                        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${selectedFiles.includes('problem')
                            ? 'border-blue-300 bg-blue-50/70'
                            : 'border-gray-100'
                          }`}>
                          <div className="flex items-center gap-3.5">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes('problem') ? 'border-blue-400 bg-blue-400' : 'border-gray-300'
                              }`}>
                              {selectedFiles.includes('problem') && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-[15px] font-bold text-gray-800">문제지</span>
                          </div>
                          {material.priceProblem > 0
                            ? <span className="font-extrabold text-gray-900">{material.priceProblem.toLocaleString()}원</span>
                            : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                          }
                        </div>
                      )}
                      {showEtcOption && (
                        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${selectedFiles.includes('etc')
                            ? 'border-blue-300 bg-blue-50/70'
                            : 'border-gray-100'
                          }`}>
                          <div className="flex items-center gap-3.5">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes('etc') ? 'border-blue-400 bg-blue-400' : 'border-gray-300'
                              }`}>
                              {selectedFiles.includes('etc') && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-[15px] font-bold text-gray-800">답지 / 기타</span>
                          </div>
                          {material.priceEtc > 0
                            ? <span className="font-extrabold text-gray-900">{material.priceEtc.toLocaleString()}원</span>
                            : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                          }
                        </div>
                      )}
                      {selectedAmount > 0 && (
                        <div className="flex justify-between items-center pt-5 pb-2 border-t border-gray-100 mt-2">
                          <span className="text-[15px] font-extrabold text-gray-500">총 결제금액</span>
                          <span className="font-extrabold text-blue-500 text-[1.75rem] tracking-tight">
                            {selectedAmount.toLocaleString()}<span className="text-lg text-gray-600 ml-1">원</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    href={purchaseUrl}
                    className="m-detail-btn-primary w-full py-4 text-[16px] rounded-2xl relative z-10"
                  >
                    <ShoppingCart size={20} />
                    <span>결제하고 다운로드</span>
                  </Link>
                </>
              )}
            </div>

            {/* 난이도 피드백 */}
            {isLoggedIn && (material.isFree || purchasedFileTypes.length > 0) && (
              <div className="m-detail-card p-6">
                <p className="text-[17px] font-extrabold text-gray-900 mb-1">학습 후 난이도 평가</p>
                <p className="text-[13px] text-gray-400 mb-6 font-medium">참여해주신 데이터는 ELO 맞춤 큐레이션에 반영됩니다.</p>
                <AnimatePresence mode="wait">
                  {!feedbackSent ? (
                    <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'easy' as const, label: '쉬웠어요', icon: <TrendingUp size={20} />, color: 'text-blue-500 border-blue-100 hover:bg-blue-50 hover:border-blue-200' },
                          { val: 'normal' as const, label: '적당해요', icon: <Minus size={20} />, color: 'text-blue-500 border-blue-100 hover:bg-blue-50 hover:border-blue-200' },
                          { val: 'hard' as const, label: '어려웠어요', icon: <TrendingDown size={20} />, color: 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300' },
                        ].map(({ val, label, icon, color }) => (
                          <button
                            key={val}
                            onClick={() => sendFeedback(val)}
                            disabled={feedbackLoading}
                            className={`flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border-[2px] transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed ${color}`}
                          >
                            {feedbackLoading ? <span className="w-6 h-6 border-[3px] border-current border-t-transparent rounded-full animate-spin" /> : icon}
                            <span className="text-[13px] font-extrabold leading-tight text-center">{label}</span>
                          </button>
                        ))}
                      </div>
                      {feedbackError && (
                        <p className="text-xs text-red-500 font-medium text-center">{feedbackError}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-2xl p-5">
                        <CheckCircle2 size={26} className="text-blue-400 shrink-0" />
                        <div>
                          <p className="text-base font-semibold text-blue-600">피드백 완료!</p>
                          {feedbackResult && (
                            <p className="text-sm text-blue-500 mt-0.5">
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
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border border-blue-100 shadow-sm shadow-blue-100/60">
                <Users size={18} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">함께 많이 찾는 자료</h2>
                <p className="text-xs text-gray-400 font-medium">관련 추천 자료</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedMaterials.map((r) => {
                const rTitle = [
                  r.schoolName,
                  r.year ? `${r.year}년` : '',
                  r.gradeNumber ? `${r.gradeNumber}학년` : '',
                  r.semester ? `${r.semester}학기` : '',
                  r.subject,
                  r.topic,
                ].filter(Boolean).join(' ');
                const rdc = r.difficultyColor;

                return (
                  <Link
                    key={r.materialId}
                    href={`/m/materials/${r.materialId}`}
                    className="group m-detail-card hover:border-blue-200 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {r.previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${r.previewImages[0]}`}
                          alt={rTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <BookOpen size={24} className="text-gray-300" />
                        </div>
                      )}
                      {r.isFree && (
                        <span className="absolute top-3 left-3 text-[10px] font-extrabold text-blue-600 bg-blue-100 border border-blue-200 px-2 py-1 rounded-full">FREE</span>
                      )}
                    </div>
                    <div className="p-4">
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-block mb-2.5 border ${diffStyle[rdc] || diffStyle.blue}`}>
                        {r.difficultyLabel}
                      </span>
                      <p className="text-[14px] font-bold text-gray-900 truncate leading-snug group-hover:text-blue-500 transition-colors">{rTitle || r.subject}</p>
                      <p className="text-[13px] text-gray-400 mt-1 truncate font-medium">{r.subject}{r.topic ? ` · ${r.topic}` : ''}</p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <p className="text-[13px] font-extrabold text-gray-800">
                          {r.isFree ? (
                            <span className="text-blue-500">무료</span>
                          ) : r.priceProblem > 0 ? (
                            `${r.priceProblem.toLocaleString()}원~`
                          ) : '가격 문의'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <ShoppingBag size={11} />
                          <span>{(r.downloadCount ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
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
