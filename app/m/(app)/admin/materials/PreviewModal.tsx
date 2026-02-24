'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Eye, X, BookOpen, Download, ExternalLink,
  Lock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  FILE_TYPE_LABEL,
  TARGET_AUDIENCE_LABEL,
  MATERIAL_SOURCE_CATEGORY_LABEL,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { buildMaterialTitle, resolveSourceCategory } from '@/lib/material-display';
import { getDifficultyBadgeClass } from '@/lib/material-difficulty-style';

interface MaterialPreview {
  materialId:     string;
  sourceCategory: MaterialSourceCategory;
  type:           string;
  publisher:      string;
  bookTitle:      string;
  ebookDescription?: string;
  ebookToc?:       string[];
  subject:        string;
  topic:          string;
  schoolLevel:    string;
  gradeNumber:    number;
  year:           number;
  semester:       number;
  schoolName:     string;
  difficulty:     number;
  isFree:         boolean;
  priceProblem:   number;
  priceEtc:       number;
  previewImages:  string[];
  fileType:       string;
  targetAudience: string;
}

interface Props {
  material: MaterialPreview;
}

export default function PreviewModal({ material }: Props) {
  const [open,  setOpen]  = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const resolvedSourceCategory = resolveSourceCategory(material);
  const isSchoolExam = resolvedSourceCategory === 'school_exam';
  const isEbook = resolvedSourceCategory === 'ebook';
  const title = buildMaterialTitle(material);
  const ebookTocItems = Array.isArray(material.ebookToc)
    ? material.ebookToc.map((item) => item.trim()).filter(Boolean)
    : [];

  const dc = DIFFICULTY_COLOR[material.difficulty] || 'blue';
  const imgs = material.previewImages;

  return (
    <>
      <button
        onClick={() => { setImgIdx(0); setOpen(true); }}
        title="구매자 화면 미리보기"
        className="p-1.5 text-gray-400 hover:text-[var(--color-dre-blue)] hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Eye size={15} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: '90vw', maxWidth: 860, maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-[var(--color-dre-blue)]" />
                <span className="text-sm font-bold text-gray-700">구매자 화면 미리보기</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/m/materials/${material.materialId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ExternalLink size={13} /> 새 탭
                </a>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid lg:grid-cols-5 gap-5">

                {/* 좌측: 미리보기 이미지 */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden flex items-center justify-center">
                      {imgs.length > 0 ? (
                        <>
                          <Image
                            src={`/uploads/previews/${imgs[imgIdx]}`}
                            alt={`미리보기 ${imgIdx + 1}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 55vw"
                            className="object-cover"
                          />
                          {!material.isFree && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
                          )}
                          {imgs.length > 1 && (
                            <>
                              <button
                                onClick={() => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                                className="absolute left-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                onClick={() => setImgIdx((i) => (i + 1) % imgs.length)}
                                className="absolute right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </>
                          )}
                          {!material.isFree && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                                <Lock size={13} className="text-gray-500" />
                                <span className="text-xs text-gray-600 font-medium">구매 후 전체 열람 가능</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-200">
                          <BookOpen size={48} />
                          <p className="text-sm mt-3 text-gray-300">미리보기 없음</p>
                        </div>
                      )}
                    </div>

                    {imgs.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {imgs.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`relative w-10 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                              i === imgIdx ? 'border-[var(--color-dre-blue)]' : 'border-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <Image
                              src={`/uploads/previews/${img}`}
                              alt={`썸네일 ${i + 1}`}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 정보 & 구매 카드 */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDifficultyBadgeClass(dc, 'strongOutline')}`}>
                        {DIFFICULTY_LABEL[material.difficulty] || '표준'}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{material.type}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {MATERIAL_SOURCE_CATEGORY_LABEL[resolvedSourceCategory] || '내신기출'}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        material.fileType === 'hwp' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                      }`}>{FILE_TYPE_LABEL[material.fileType] || 'PDF'}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        material.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                      }`}>{TARGET_AUDIENCE_LABEL[material.targetAudience] || '학생용'}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{title || material.bookTitle || material.subject}</h2>

                    <div className="space-y-2 text-sm">
                      {[
                        { key: 'type', label: '유형', value: material.type || '-' },
                        ...(isSchoolExam
                          ? [
                              { key: 'subject', label: '과목', value: material.subject || '-' },
                              { key: 'school', label: '학교', value: material.schoolName || '-' },
                              { key: 'exam', label: '시험', value: [material.year ? `${material.year}년` : '', material.semester ? `${material.semester}학기` : ''].filter(Boolean).join(' ') || '-' },
                            ]
                          : isEbook
                            ? [
                                { key: 'publisher', label: '출판사', value: material.publisher || '-' },
                                { key: 'bookTitle', label: '도서명', value: material.bookTitle || '-' },
                                { key: 'year', label: '연도', value: material.year ? `${material.year}년` : '-' },
                                { key: 'topic', label: '주제/키워드', value: material.topic || '-' },
                              ]
                            : [
                                { key: 'subject', label: '과목', value: material.subject || '-' },
                                { key: 'publisher', label: '출판사', value: material.publisher || '-' },
                                { key: 'bookTitle', label: '교재명', value: material.bookTitle || '-' },
                                { key: 'target', label: '대상', value: [material.schoolLevel || '', material.gradeNumber ? `${material.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-' },
                                { key: 'year', label: '연도', value: material.year ? `${material.year}년` : '-' },
                                { key: 'topic', label: '단원/주제', value: material.topic || '-' },
                              ]),
                      ].map(({ key, label, value }) => (
                        <div key={key} className="flex justify-between py-1.5 border-b border-gray-50">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>

                    {isEbook && (material.ebookDescription || ebookTocItems.length > 0) && (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1.5">책 소개</p>
                          <p className="text-[13px] leading-relaxed text-gray-600">
                            {material.ebookDescription || '설명이 아직 등록되지 않았습니다.'}
                          </p>
                        </div>
                        {ebookTocItems.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 mb-1.5">목차</p>
                            <ul className="space-y-1">
                              {ebookTocItems.slice(0, 8).map((item, idx) => (
                                <li key={`${item}-${idx}`} className="text-[13px] text-gray-600">
                                  {idx + 1}. {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {material.isFree ? (
                      <button className="w-full py-3 bg-[var(--color-dre-blue)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm opacity-80 cursor-default">
                        <Download size={16} />
                        무료 다운로드
                      </button>
                    ) : (
                      <>
                        <div className="mb-4">
                          {material.priceProblem > 0 && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-600">문제지</span>
                              <span className="font-bold text-gray-900">{material.priceProblem.toLocaleString()}원</span>
                            </div>
                          )}
                          {material.priceEtc > 0 && (
                            <div className="flex justify-between items-center py-2 border-t border-gray-50">
                              <span className="text-sm text-gray-600">기타(답지 등)</span>
                              <span className="font-bold text-gray-900">{material.priceEtc.toLocaleString()}원</span>
                            </div>
                          )}
                        </div>
                        <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-default">
                          <ExternalLink size={16} />
                          구매하기
                        </button>
                      </>
                    )}
                    <p className="text-center text-xs text-gray-300 mt-3">미리보기 — 버튼은 실제 구매자 화면에서 동작합니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
