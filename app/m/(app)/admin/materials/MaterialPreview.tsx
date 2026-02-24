'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Download, ExternalLink, Lock } from 'lucide-react';
import {
  DIFFICULTY_LABEL, DIFFICULTY_COLOR,
  FILE_TYPE_LABEL, TARGET_AUDIENCE_LABEL,
  MATERIAL_SOURCE_CATEGORY_LABEL,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { buildMaterialTitle, resolveSourceCategory } from '@/lib/material-display';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  red:     'bg-red-100 text-red-700 border-red-200',
};

interface FormData {
  sourceCategory:  MaterialSourceCategory;
  type:            string;
  publisher:       string;
  bookTitle:       string;
  ebookDescription:string;
  ebookToc:        string;
  subject:         string;
  topic:           string;
  schoolLevel:     string;
  gradeNumber:     number;
  year:            number;
  semester:        number;
  schoolName:      string;
  difficulty:      number;
  fileType:        string;
  targetAudience:  string;
  isFree:          boolean;
  priceProblem:    number;
  priceEtc:        number;
  previewImages?:  string[];
}

export default function MaterialPreview({ data }: { data: FormData }) {
  const [activePreview, setActivePreview] = useState(0);
  const images = data.previewImages || [];
  const resolvedSourceCategory = resolveSourceCategory(data);
  const isSchoolExam = resolvedSourceCategory === 'school_exam';
  const isEbook = resolvedSourceCategory === 'ebook';
  const ebookTocItems = data.ebookToc
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  const title = buildMaterialTitle(data);

  const dc = DIFFICULTY_COLOR[data.difficulty] || 'blue';

  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-sm font-semibold text-gray-500">구매자 화면 미리보기</p>
        <p className="text-xs text-gray-400 mt-0.5">등록 전 노출 상태를 실시간으로 확인할 수 있습니다</p>
      </div>

      <div className="grid 2xl:grid-cols-5 gap-4">
        {/* 좌측: 미리보기 이미지 자리 */}
        <div className="2xl:col-span-3">
          <div className="bg-white rounded-2xl border border-blue-100/70 shadow-sm overflow-hidden">
            <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
              {images.length > 0 ? (
                <>
                  <Image
                    src={`/uploads/previews/${images[activePreview]}`}
                    alt={`미리보기 ${activePreview + 1}`}
                    fill
                    sizes="(max-width: 1536px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {!data.isFree && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-white" />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center">
                  <BookOpen size={42} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">미리보기 이미지를 업로드해 주세요</p>
                </div>
              )}
              {!data.isFree && images.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-gray-100">
                    <Lock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">구매 후 전체 열람 가능</span>
                  </div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-2.5 overflow-x-auto border-t border-gray-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePreview(i)}
                    className={`relative w-14 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      i === activePreview ? 'border-[var(--color-dre-blue)] shadow-sm' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <Image
                      src={`/uploads/previews/${img}`}
                      alt={`썸네일 ${i + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 정보 & 구매 카드 */}
        <div className="2xl:col-span-2 space-y-3">
          {/* 자료 정보 카드 */}
          <div className="bg-white rounded-2xl border border-blue-100/70 shadow-sm p-4">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diffStyle[dc] || diffStyle.blue}`}>
                {DIFFICULTY_LABEL[data.difficulty] || '표준'}
              </span>
              {data.type && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{data.type}</span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {MATERIAL_SOURCE_CATEGORY_LABEL[resolvedSourceCategory] || '내신기출'}
              </span>
              {data.fileType && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  data.fileType === 'hwp' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                }`}>{FILE_TYPE_LABEL[data.fileType] || 'PDF'}</span>
              )}
              {data.targetAudience && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  data.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                }`}>{TARGET_AUDIENCE_LABEL[data.targetAudience] || '학생용'}</span>
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-3 leading-snug min-h-[3rem]">
              {title || data.bookTitle || <span className="text-gray-300">제목이 여기에 표시됩니다</span>}
            </h2>

            <div className="space-y-1.5 text-sm">
                {[
                  { key: 'type', label: '유형', value: data.type || '-' },
                  ...(isSchoolExam
                    ? [
                        { key: 'subject', label: '과목', value: data.subject || '-' },
                        { key: 'school', label: '학교', value: data.schoolName || '-' },
                      { key: 'exam', label: '시험', value: [data.year ? `${data.year}년` : '', data.semester ? `${data.semester}학기` : ''].filter(Boolean).join(' ') || '-' },
                    ]
                  : isEbook
                    ? [
                        { key: 'publisher', label: '출판사', value: data.publisher || '-' },
                        { key: 'bookTitle', label: '도서명', value: data.bookTitle || '-' },
                        { key: 'year', label: '연도', value: data.year ? `${data.year}년` : '-' },
                        { key: 'topic', label: '주제/키워드', value: data.topic || '-' },
                      ]
                    : [
                        { key: 'subject', label: '과목', value: data.subject || '-' },
                        { key: 'publisher', label: '출판사', value: data.publisher || '-' },
                        { key: 'bookTitle', label: '교재명', value: data.bookTitle || '-' },
                        { key: 'target', label: '대상', value: [data.schoolLevel || '', data.gradeNumber ? `${data.gradeNumber}학년` : ''].filter(Boolean).join(' · ') || '-' },
                        { key: 'year', label: '연도', value: data.year ? `${data.year}년` : '-' },
                        { key: 'topic', label: '단원/주제', value: data.topic || '-' },
                      ]),
              ].map(({ key, label, value }) => (
                <div key={key} className="flex justify-between gap-4 py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-medium ${value === '-' ? 'text-gray-300' : 'text-gray-700'}`}>{value}</span>
                </div>
              ))}
            </div>

            {isEbook && (data.ebookDescription || ebookTocItems.length > 0) && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5">책 소개</p>
                  <p className="text-[13px] leading-relaxed text-gray-600">
                    {data.ebookDescription || '설명이 아직 등록되지 않았습니다.'}
                  </p>
                </div>
                {ebookTocItems.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1.5">목차</p>
                    <ul className="space-y-1">
                      {ebookTocItems.slice(0, 6).map((item, idx) => (
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

          {/* 구매/다운로드 카드 */}
          <div className="bg-white rounded-2xl border border-blue-100/70 shadow-sm p-4">
            {data.isFree ? (
              <button className="w-full py-3 bg-[var(--color-dre-blue)] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-70 cursor-default">
                <Download size={16} />
                무료 다운로드
              </button>
            ) : (
              <>
                <div className="mb-3.5">
                  {data.priceProblem > 0 && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-sm text-gray-600">문제지</span>
                      <span className="text-base font-bold text-gray-900">{data.priceProblem.toLocaleString()}원</span>
                    </div>
                  )}
                  {data.priceEtc > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                      <span className="text-sm text-gray-600">기타(답지 등)</span>
                      <span className="text-base font-bold text-gray-900">{data.priceEtc.toLocaleString()}원</span>
                    </div>
                  )}
                  {data.priceProblem === 0 && data.priceEtc === 0 && (
                    <p className="text-sm text-gray-300 text-center py-1">가격 미입력</p>
                  )}
                </div>
                <button className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-70 cursor-default">
                  <ExternalLink size={16} />
                  구매하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
