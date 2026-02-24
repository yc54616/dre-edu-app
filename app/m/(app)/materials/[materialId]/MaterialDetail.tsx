'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, BookOpen, ShoppingBag, Download, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Lock, ShoppingCart,
  FileText, School, Calendar, Users, RotateCcw, Check, LayoutGrid, List, ZoomIn, ZoomOut, X,
} from 'lucide-react';
import {
  MATERIAL_SOURCE_CATEGORY_LABEL,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { buildMaterialTitle, buildMaterialSubline, resolveSourceCategory } from '@/lib/material-display';
import { getDifficultyBadgeClass } from '@/lib/material-difficulty-style';

interface MaterialData {
  materialId: string;
  sourceCategory?: MaterialSourceCategory;
  type: string;
  publisher?: string;
  bookTitle?: string;
  ebookDescription?: string;
  ebookToc?: string[];
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
  fileType?: string;
  targetAudience?: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc: number;
  previewImages: string[];
  pageCount?: number;
  viewCount: number;
  downloadCount: number;
  problemFile?: string | null;
  etcFile?: string | null;
}

interface RelatedMaterial {
  materialId: string;
  sourceCategory?: MaterialSourceCategory;
  subject: string;
  topic: string;
  type: string;
  publisher?: string;
  bookTitle?: string;
  schoolName: string;
  year: number;
  gradeNumber: number;
  semester: number;
  difficulty: number;
  difficultyLabel: string;
  difficultyColor: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc?: number;
  targetAudience?: string;
  previewImages: string[];
  downloadCount: number;
}

type SelectableFile = 'problem' | 'etc';
type RelatedViewMode = 'grid' | 'list';

export default function MaterialDetail({
  material,
  isLoggedIn,
  purchasedFileTypes = [],
  existingFeedback = null,
  relatedMaterials = [],
  defaultRelatedViewMode = 'grid',
}: {
  material: MaterialData;
  isLoggedIn: boolean;
  purchasedFileTypes?: string[];
  existingFeedback?: { difficulty: string; ratingChange: number; newRating: number } | null;
  relatedMaterials?: RelatedMaterial[];
  defaultRelatedViewMode?: RelatedViewMode;
}) {
  const isTeacherMaterial = material.targetAudience === 'teacher';
  const showProblemOption = material.priceProblem > 0 || !!material.problemFile;
  const showEtcOption = material.priceEtc > 0 || !!material.etcFile;
  const teacherPackageAmount = (material.priceProblem || 0) + (material.priceEtc || 0);
  const purchasedSet = new Set(
    purchasedFileTypes.filter((type): type is SelectableFile => type === 'problem' || type === 'etc')
  );
  const hasAnyPurchased = isTeacherMaterial ? purchasedSet.size > 0 : (purchasedSet.has('problem') || purchasedSet.has('etc'));
  const hasPurchasedProblem = isTeacherMaterial ? hasAnyPurchased : purchasedSet.has('problem');
  const hasPurchasedEtc = isTeacherMaterial ? hasAnyPurchased : purchasedSet.has('etc');
  const canBuyProblem = !isTeacherMaterial && showProblemOption && !hasPurchasedProblem;
  const canBuyEtc = !isTeacherMaterial && showEtcOption && !hasPurchasedEtc;
  const hasBuyableOption = isTeacherMaterial ? !hasAnyPurchased : (canBuyProblem || canBuyEtc);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFiles, setSelectedFiles] = useState<SelectableFile[]>(() => [
    ...(isTeacherMaterial ? [] : (canBuyProblem ? (['problem'] as SelectableFile[]) : [])),
    ...(isTeacherMaterial ? [] : (canBuyEtc ? (['etc'] as SelectableFile[]) : [])),
  ]);
  const selectedAmount = isTeacherMaterial
    ? teacherPackageAmount
    : (
      (selectedFiles.includes('problem') ? material.priceProblem : 0) +
      (selectedFiles.includes('etc') ? material.priceEtc : 0)
    );

  const [feedbackSent, setFeedbackSent] = useState(!!existingFeedback);
  const [feedbackResult, setFeedbackResult] = useState<{ ratingChange: number; newRating: number } | null>(
    existingFeedback ? { ratingChange: existingFeedback.ratingChange, newRating: existingFeedback.newRating } : null
  );
  const [undoing, setUndoing] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [activePreview, setActivePreview] = useState(0);
  const [downloading, setDownloading] = useState<'problem' | 'etc' | null>(null);
  const [relatedViewMode, setRelatedViewMode] = useState<RelatedViewMode>(defaultRelatedViewMode);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

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
  const backToListHref = searchParams.get('from') || '/m/materials';

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

  const toggleFileSelection = (type: SelectableFile) => {
    if (isTeacherMaterial) return;
    if ((type === 'problem' && !canBuyProblem) || (type === 'etc' && !canBuyEtc)) return;
    setSelectedFiles((prev) => (
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    ));
  };

  const handlePurchaseClick = () => {
    if (isTeacherMaterial) {
      router.push(`/m/purchase/${material.materialId}`);
      return;
    }
    if (selectedFiles.length === 0) return;
    router.push(`/m/purchase/${material.materialId}?files=${selectedFiles.join(',')}`);
  };

  const title = buildMaterialTitle(material);
  const subline = buildMaterialSubline(material);
  const resolvedSourceCategory = resolveSourceCategory(material);
  const sourceLabel = MATERIAL_SOURCE_CATEGORY_LABEL[resolvedSourceCategory] || '내신기출';
  const isSchoolExam = resolvedSourceCategory === 'school_exam';
  const isEbook = resolvedSourceCategory === 'ebook';
  const toFileExtLabel = (fileName?: string | null): string | null => {
    if (!fileName) return null;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (!ext) return null;
    if (ext === 'pdf') return 'PDF';
    if (ext === 'hwp') return 'HWP';
    if (ext === 'hwpx') return 'HWPX';
    return ext.toUpperCase();
  };
  const fileFormatParts: string[] = [];
  const problemFileExt = toFileExtLabel(material.problemFile);
  const etcFileExt = toFileExtLabel(material.etcFile);
  if (problemFileExt) fileFormatParts.push(`문제 ${problemFileExt}`);
  if (etcFileExt) fileFormatParts.push(`${isTeacherMaterial ? '부가' : '기타'} ${etcFileExt}`);
  const fallbackFileFormat = material.fileType === 'hwp'
    ? 'HWP'
    : material.fileType === 'both'
      ? 'PDF · HWP'
      : 'PDF';
  const fileFormatValue = fileFormatParts.length > 0 ? fileFormatParts.join(' · ') : fallbackFileFormat;
  const ebookTocItems = Array.isArray(material.ebookToc)
    ? material.ebookToc.map((item) => item.trim()).filter(Boolean)
    : [];
  const detailRows = [
    { key: 'sourceCategory', icon: <FileText size={15} />, label: '분류', value: sourceLabel },
    { key: 'fileFormat', icon: <FileText size={15} />, label: '파일 형식', value: fileFormatValue },
    ...(!isEbook
      ? [
          { key: 'subject', icon: <FileText size={15} />, label: '과목', value: material.subject || '-' },
          { key: 'type', icon: <BookOpen size={15} />, label: '유형', value: material.type || '-' },
        ]
      : []),
    ...(isSchoolExam
      ? [
          {
            key: 'school',
            icon: <School size={15} />,
            label: '학교',
            value: [material.schoolName, material.schoolLevel, material.gradeNumber ? `${material.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-',
          },
          {
            key: 'exam',
            icon: <Calendar size={15} />,
            label: '시험',
            value: [material.year ? `${material.year}년` : '', material.semester ? `${material.semester}학기` : ''].filter(Boolean).join(' ') || '-',
          },
        ]
      : isEbook
        ? [
            { key: 'publisher', icon: <School size={15} />, label: '출판사', value: material.publisher || '-' },
            { key: 'bookTitle', icon: <BookOpen size={15} />, label: '도서명', value: material.bookTitle || '-' },
            { key: 'year', icon: <Calendar size={15} />, label: '연도', value: material.year ? `${material.year}년` : '-' },
          ]
        : [
            { key: 'publisher', icon: <School size={15} />, label: '출판사', value: material.publisher || '-' },
            { key: 'bookTitle', icon: <BookOpen size={15} />, label: '교재명', value: material.bookTitle || '-' },
            {
              key: 'target',
              icon: <Calendar size={15} />,
              label: '대상',
              value: [material.schoolLevel, material.gradeNumber ? `${material.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-',
            },
            { key: 'year', icon: <Calendar size={15} />, label: '연도', value: material.year ? `${material.year}년` : '-' },
          ]),
    { key: 'topic', icon: <BookOpen size={15} />, label: isEbook ? '주제/키워드' : '단원/주제', value: material.topic || '-' },
  ];

  useEffect(() => {
    if (!previewModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewModalOpen(false);
        return;
      }

      if (event.key === 'ArrowRight' && material.previewImages.length > 1) {
        setActivePreview((prev) => (prev + 1) % material.previewImages.length);
        return;
      }

      if (event.key === 'ArrowLeft' && material.previewImages.length > 1) {
        setActivePreview((prev) => (prev - 1 + material.previewImages.length) % material.previewImages.length);
        return;
      }

      if (event.key === '+' || event.key === '=') {
        setPreviewZoom((prev) => Math.min(3, Math.round((prev + 0.25) * 100) / 100));
        return;
      }

      if (event.key === '-' || event.key === '_') {
        setPreviewZoom((prev) => Math.max(1, Math.round((prev - 0.25) * 100) / 100));
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewModalOpen, material.previewImages.length]);

  const openPreviewModal = () => {
    if (material.previewImages.length === 0) return;
    setPreviewZoom(1);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
  };

  return (
    <div className="m-detail-page min-h-screen">

      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-5 sm:py-7">
          <Link
            href={backToListHref}
            className="group mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-blue-500 sm:mb-5 sm:text-base"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료 목록으로
          </Link>

          <div className="m-detail-card p-5 sm:p-6">
            <div className="min-w-0">
              <p className="m-detail-kicker mb-2">자료 모음 상세</p>
              <h1 className="m-detail-title break-words">
                {title || material.bookTitle || material.subject}
              </h1>
              <p className="m-detail-subtitle mt-2">
                {subline || material.bookTitle || material.subject}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${getDifficultyBadgeClass(dc, 'softOutline')}`}>
                  {material.difficultyLabel}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-500">{material.type}</span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-500">{sourceLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="m-detail-container max-w-7xl py-6 sm:py-7">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">

          {/* ── 좌측: 미리보기 ── */}
          <div className="space-y-5 lg:col-span-7">
            <div className="m-detail-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <BookOpen size={15} className="text-gray-400" />
                  {material.pageCount && material.pageCount > 0
                    ? `총 ${material.pageCount.toLocaleString()}페이지`
                    : '총 페이지 정보 없음'}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {material.previewImages.length > 0 ? `미리보기 ${activePreview + 1} / ${material.previewImages.length}` : '미리보기 없음'}
                </p>
              </div>
              <div className="p-3 sm:p-4">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 ${
                    material.previewImages.length > 0 ? 'cursor-zoom-in' : ''
                  }`}
                  onClick={openPreviewModal}
                >
                  {material.previewImages.length > 0 ? (
                    <>
                      <Image
                        src={`/uploads/previews/${material.previewImages[activePreview]}`}
                        alt="미리보기"
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain bg-white"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPreviewModal();
                        }}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:text-blue-500"
                      >
                        <ZoomIn size={13} />
                        확대
                      </button>
                      {!material.isFree && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-white" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                        <BookOpen size={32} className="text-gray-300" />
                      </div>
                      <p className="text-base text-gray-300 font-medium">미리보기 없음</p>
                    </div>
                  )}
                  {!material.isFree && material.previewImages.length > 0 && (
                    <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none">
                      <div className="flex items-center gap-2.5 rounded-full border border-gray-100 bg-white/90 px-5 py-3 shadow-md backdrop-blur-md">
                        <Lock size={14} className="text-gray-500" />
                        <span className="text-[13px] text-gray-700 font-semibold">구매 후 전체 열람 가능</span>
                      </div>
                    </div>
                  )}
                </div>
                {material.previewImages.length > 1 && (
                  <div className="m-scrollbar flex gap-2.5 overflow-x-auto p-3">
                    {material.previewImages.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setActivePreview(i)}
                        className={`relative w-[4.5rem] h-[6rem] rounded-xl overflow-hidden border-[3px] shrink-0 transition-all duration-200 ${i === activePreview
                            ? 'border-blue-300 shadow-sm shadow-blue-100'
                            : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                          }`}
                      >
                        <Image
                          src={`/uploads/previews/${img}`}
                          alt={`미리보기 ${i + 1}`}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <div className="m-detail-soft flex items-center justify-between px-4 py-3 sm:px-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <ShoppingBag size={12} className="text-gray-400" />
                    {(material.downloadCount ?? 0).toLocaleString()}명 구매
                  </div>
                  <p className="text-xs font-semibold text-gray-500">
                    조회 {material.viewCount.toLocaleString()}회
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 우측: 정보 & 구매 ── */}
          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-4">
              {/* 자료 정보 */}
              <div className="m-detail-card overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FileText size={15} className="text-gray-400" />
                    자료 상세 정보
                  </p>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {detailRows.map(({ key, icon, label, value }) => (
                      <div key={key} className="m-detail-soft px-3.5 py-3.5 sm:px-4">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <span className="text-gray-400">{icon}</span>
                          {label}
                        </p>
                        <p className="mt-1.5 text-[15px] font-semibold leading-6 text-slate-700 break-words">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {isEbook && (
                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                      <div className="m-detail-soft rounded-2xl p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">책 소개</p>
                        <p className="mt-2 text-[15px] leading-7 font-medium text-slate-700 whitespace-pre-line">
                          {material.ebookDescription || '설명이 아직 등록되지 않았습니다.'}
                        </p>
                      </div>
                      <div className="m-detail-soft rounded-2xl p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">목차</p>
                        {ebookTocItems.length > 0 ? (
                          <ol className="mt-2 space-y-2">
                            {ebookTocItems.map((item, idx) => (
                              <li key={`${item}-${idx}`} className="flex items-start gap-2.5 text-[15px] font-medium text-slate-700">
                                <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-bold text-blue-600">
                                  {idx + 1}
                                </span>
                                <span className="leading-6">{item}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="mt-2 text-[15px] text-slate-400">목차가 아직 등록되지 않았습니다.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 구매 카드 */}
              <div className="m-detail-card overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ShoppingCart size={15} className="text-gray-400" />
                    구매 / 다운로드
                  </p>
                </div>
                <div className="relative p-5 sm:p-6">

                  {/* 소셜 프루프 */}
                  {(material.downloadCount ?? 0) > 0 && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
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
                          : <><Download size={18} />{isTeacherMaterial ? '자료 다운로드' : '문제지 다운로드'}</>
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
                          : <><Download size={16} />{isTeacherMaterial ? '부가 자료 다운로드' : '답지 / 기타 다운로드'}</>
                        }
                      </button>
                    )}
                    {!material.problemFile && !material.etcFile && (
                      <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasAnyPurchased && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-blue-400" />
                          <p className="text-base font-semibold text-blue-600">
                            {isTeacherMaterial ? '구매 완료' : (hasBuyableOption ? '일부 파일 구매 완료' : '구매 완료')}
                          </p>
                        </div>
                        {hasPurchasedProblem && material.problemFile && (
                          <button
                            onClick={() => handleDownload('problem')}
                            disabled={downloading === 'problem'}
                            className="m-detail-btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                          >
                            {downloading === 'problem'
                              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                              : <><Download size={18} />{isTeacherMaterial ? '자료 다운로드' : '문제지 다운로드'}</>
                            }
                          </button>
                        )}
                        {hasPurchasedEtc && material.etcFile && (
                          <button
                            onClick={() => handleDownload('etc')}
                            disabled={downloading === 'etc'}
                            className="m-detail-btn-secondary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {downloading === 'etc'
                              ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />다운로드 중...</>
                              : <><Download size={16} />{isTeacherMaterial ? '부가 자료 다운로드' : '답지 / 기타 다운로드'}</>
                            }
                          </button>
                        )}
                        {((hasPurchasedProblem && !material.problemFile) || (hasPurchasedEtc && !material.etcFile)) && (
                          <p className="text-center text-sm text-gray-400 py-2">일부 파일은 준비 중입니다</p>
                        )}
                      </div>
                    )}

                    {hasBuyableOption ? (
                      isTeacherMaterial ? (
                        <>
                          <div className="m-detail-soft p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">교사용 자료 패키지</span>
                              <span className="font-extrabold text-gray-900">{selectedAmount.toLocaleString()}원</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              현재 자료의 본문/부가 파일을 묶음으로 구매합니다.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handlePurchaseClick}
                            className="m-detail-btn-primary w-full py-4 text-[16px] rounded-2xl relative z-10"
                          >
                            <ShoppingCart size={20} />
                            <span>결제하고 다운로드</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="space-y-3 mb-1 relative z-10">
                            {canBuyProblem && (
                              <button
                                type="button"
                                onClick={() => toggleFileSelection('problem')}
                                className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${selectedFiles.includes('problem')
                                  ? 'border-blue-300 bg-blue-50/70'
                                  : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40'
                                }`}>
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes('problem') ? 'border-blue-400 bg-blue-400' : 'border-gray-300'
                                    }`}>
                                    {selectedFiles.includes('problem') && <Check size={12} className="text-white" />}
                                  </div>
                                  <span className="text-sm font-bold text-gray-800 sm:text-[15px]">문제지</span>
                                </div>
                                {material.priceProblem > 0
                                  ? <span className="font-extrabold text-gray-900">{material.priceProblem.toLocaleString()}원</span>
                                  : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                                }
                              </button>
                            )}
                            {canBuyEtc && (
                              <button
                                type="button"
                                onClick={() => toggleFileSelection('etc')}
                                className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${selectedFiles.includes('etc')
                                  ? 'border-blue-300 bg-blue-50/70'
                                  : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40'
                                }`}>
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes('etc') ? 'border-blue-400 bg-blue-400' : 'border-gray-300'
                                    }`}>
                                    {selectedFiles.includes('etc') && <Check size={12} className="text-white" />}
                                  </div>
                                  <span className="text-sm font-bold text-gray-800 sm:text-[15px]">답지 / 기타</span>
                                </div>
                                {material.priceEtc > 0
                                  ? <span className="font-extrabold text-gray-900">{material.priceEtc.toLocaleString()}원</span>
                                  : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                                }
                              </button>
                            )}
                            {selectedFiles.length === 0 && (
                              <p className="text-[13px] font-semibold text-red-500">구매할 파일을 1개 이상 선택해 주세요.</p>
                            )}
                            {selectedAmount > 0 && (
                              <div className="flex justify-between items-center pt-5 pb-2 border-t border-gray-100 mt-2">
                                <span className="text-[15px] font-extrabold text-gray-500">총 결제금액</span>
                                <span className="font-extrabold text-blue-500 text-[1.45rem] tracking-tight sm:text-[1.75rem]">
                                  {selectedAmount.toLocaleString()}<span className="ml-1 text-base text-gray-600 sm:text-lg">원</span>
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handlePurchaseClick}
                            disabled={selectedFiles.length === 0}
                            className="m-detail-btn-primary w-full py-4 text-[16px] rounded-2xl relative z-10 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart size={20} />
                            <span>{hasAnyPurchased ? '남은 파일 결제하기' : '결제하고 다운로드'}</span>
                          </button>
                        </>
                      )
                    ) : (
                      !hasAnyPurchased && <p className="text-center text-sm text-gray-400 py-2">파일 준비 중입니다</p>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* 난이도 피드백 */}
            {isLoggedIn && (material.isFree || hasAnyPurchased) && (
              <div className="m-detail-card p-5 sm:p-6">
                <p className="mb-1 text-base font-bold text-slate-700 sm:text-lg">학습 후 난이도 평가</p>
                <p className="mb-5 text-sm text-slate-500">참여해주신 데이터는 ELO 맞춤 큐레이션에 반영됩니다.</p>
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
                            className={`flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border-[2px] transition-all hover:border-blue-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed ${color}`}
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

        <AnimatePresence>
          {previewModalOpen && material.previewImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-slate-900/85 backdrop-blur-sm p-3 sm:p-6"
              onClick={closePreviewModal}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0.9 }}
                transition={{ duration: 0.16 }}
                className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/75"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5 text-white sm:px-4 sm:py-3">
                  <p className="text-sm font-semibold">
                    미리보기 {activePreview + 1} / {material.previewImages.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((prev) => Math.max(1, Math.round((prev - 0.25) * 100) / 100))}
                      disabled={previewZoom <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/90 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="min-w-[3rem] text-center text-xs font-semibold text-white/80">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((prev) => Math.min(3, Math.round((prev + 0.25) * 100) / 100))}
                      disabled={previewZoom >= 3}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/90 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={closePreviewModal}
                      className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/90 transition-colors hover:bg-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-3 sm:p-5">
                  <div className="flex min-h-full min-w-full items-center justify-center">
                    <Image
                      src={`/uploads/previews/${material.previewImages[activePreview]}`}
                      alt={`미리보기 확대 ${activePreview + 1}`}
                      width={1400}
                      height={2000}
                      sizes="90vw"
                      className="max-w-none rounded-xl border border-white/20 shadow-2xl transition-transform duration-200"
                      style={{
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                </div>

                {material.previewImages.length > 1 && (
                  <div className="m-scrollbar flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-3 sm:px-4">
                    {material.previewImages.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActivePreview(index)}
                        className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          index === activePreview
                            ? 'border-blue-300 shadow-sm shadow-blue-200/40'
                            : 'border-white/20 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={`/uploads/previews/${img}`}
                          alt={`확대 썸네일 ${index + 1}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 관련 자료 섹션 ── */}
        {relatedMaterials.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border border-blue-100 shadow-sm shadow-blue-100/60">
                  <Users size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">함께 많이 찾는 자료</h2>
                  <p className="text-sm text-slate-500">관련 추천 자료</p>
                </div>
              </div>
              <div className="inline-flex items-center rounded-xl border border-blue-100 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setRelatedViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                    relatedViewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600 border border-blue-100'
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <LayoutGrid size={14} />
                  카드
                </button>
                <button
                  type="button"
                  onClick={() => setRelatedViewMode('list')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                    relatedViewMode === 'list'
                      ? 'bg-blue-100 text-blue-600 border border-blue-100'
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <List size={14} />
                  리스트
                </button>
              </div>
            </div>

            {relatedViewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {relatedMaterials.map((r) => {
                  const rTitle = buildMaterialTitle(r);
                  const rSubline = buildMaterialSubline(r);
                  const rdc = r.difficultyColor;

                  return (
                    <Link
                      key={r.materialId}
                      href={`/m/materials/${r.materialId}`}
                      className="group m-detail-card hover:border-blue-200 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {r.previewImages?.[0] ? (
                          <Image
                            src={`/uploads/previews/${r.previewImages[0]}`}
                            alt={rTitle}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <BookOpen size={24} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-block mb-2.5 border ${getDifficultyBadgeClass(rdc, 'softOutline')}`}>
                          {r.difficultyLabel}
                        </span>
                        <p className="truncate text-[15px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-blue-500">{rTitle || r.subject}</p>
                        <p className="mt-1 truncate text-sm text-gray-500">{rSubline || r.subject}</p>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <p className="text-sm font-bold text-slate-700">
                            {r.isFree ? (
                              <span className="text-blue-500">무료</span>
                            ) : (r.priceProblem + (r.priceEtc || 0)) > 0 ? (
                              `${(r.priceProblem + (r.priceEtc || 0)).toLocaleString()}원~`
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
            ) : (
              <div className="space-y-3">
                {relatedMaterials.map((r) => {
                  const rTitle = buildMaterialTitle(r);
                  const rSubline = buildMaterialSubline(r);
                  const rdc = r.difficultyColor;
                  const priceAmount = r.priceProblem + (r.priceEtc || 0);
                  const priceText = r.isFree ? '무료' : priceAmount > 0 ? `${priceAmount.toLocaleString()}원~` : '가격 문의';
                  const priceColor = r.isFree ? 'text-blue-500' : priceAmount > 0 ? 'text-slate-700' : 'text-slate-400';

                  return (
                    <Link
                      key={r.materialId}
                      href={`/m/materials/${r.materialId}`}
                      className="group m-detail-card block p-4 sm:p-5 hover:border-blue-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 sm:h-28 sm:w-24">
                          {r.previewImages?.[0] ? (
                            <Image
                              src={`/uploads/previews/${r.previewImages[0]}`}
                              alt={rTitle}
                              fill
                              sizes="(max-width: 640px) 80px, 96px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-blue-400">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${getDifficultyBadgeClass(rdc, 'softOutline')}`}>
                              {r.difficultyLabel}
                            </span>
                            <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold">
                              {r.type}
                            </span>
                          </div>

                          <p className="truncate text-[15px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-blue-500">
                            {rTitle || r.subject}
                          </p>
                          <p className="mt-1 truncate text-sm text-gray-500">{rSubline || r.subject}</p>

                          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                              <ShoppingBag size={12} />
                              <span>{(r.downloadCount ?? 0).toLocaleString()}명 구매</span>
                            </div>
                            <span className={`text-sm font-bold ${priceColor}`}>{priceText}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
