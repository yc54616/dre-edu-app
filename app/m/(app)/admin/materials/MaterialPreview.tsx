'use client';

import { useState } from 'react';
import { BookOpen, Download, ExternalLink, Lock } from 'lucide-react';
import {
  DIFFICULTY_LABEL, DIFFICULTY_COLOR,
  FILE_TYPE_LABEL, TARGET_AUDIENCE_LABEL,
} from '@/lib/constants/material';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  red:     'bg-red-100 text-red-700 border-red-200',
};

interface FormData {
  type:            string;
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

  const title = [
    data.schoolName,
    data.year        ? `${data.year}년`        : '',
    data.gradeNumber ? `${data.gradeNumber}학년` : '',
    data.semester    ? `${data.semester}학기`   : '',
    data.subject,
    data.topic,
  ].filter(Boolean).join(' ');

  const dc = DIFFICULTY_COLOR[data.difficulty] || 'blue';

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">구매자 화면 미리보기</p>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* 좌측: 미리보기 이미지 자리 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img
                    src={`/uploads/previews/${images[activePreview]}`}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  {!data.isFree && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-white" />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <BookOpen size={40} className="text-gray-200 mb-2" />
                  <p className="text-xs text-gray-300">미리보기 이미지를 업로드해 주세요</p>
                </div>
              )}
              {!data.isFree && images.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                    <Lock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">구매 후 전체 열람 가능</span>
                  </div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto border-t border-gray-50">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePreview(i)}
                    className={`w-12 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      i === activePreview ? 'border-[var(--color-dre-blue)]' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={`/uploads/previews/${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 정보 & 구매 카드 */}
        <div className="lg:col-span-2 space-y-3">
          {/* 자료 정보 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffStyle[dc] || diffStyle.blue}`}>
                {DIFFICULTY_LABEL[data.difficulty] || '표준'}
              </span>
              {data.type && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.type}</span>
              )}
              {data.fileType && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.fileType === 'hwp' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                }`}>{FILE_TYPE_LABEL[data.fileType] || 'PDF'}</span>
              )}
              {data.targetAudience && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                }`}>{TARGET_AUDIENCE_LABEL[data.targetAudience] || '학생용'}</span>
              )}
              {data.isFree && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>
              )}
            </div>

            <h2 className="text-sm font-bold text-gray-900 mb-3 leading-snug min-h-[2.5rem]">
              {title || <span className="text-gray-300">제목이 여기에 표시됩니다</span>}
            </h2>

            <div className="space-y-1.5 text-xs">
              {[
                { label: '과목',   value: data.subject     || '-' },
                { label: '단원',   value: data.topic       || '-' },
                { label: '학교급', value: data.schoolLevel || '-' },
                { label: '학년',   value: data.gradeNumber ? `${data.gradeNumber}학년` : '-' },
                { label: '학교',   value: data.schoolName  || '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-medium ${value === '-' ? 'text-gray-300' : 'text-gray-700'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 구매/다운로드 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {data.isFree ? (
              <button className="w-full py-2.5 bg-[var(--color-dre-blue)] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-70 cursor-default">
                <Download size={15} />
                무료 다운로드
              </button>
            ) : (
              <>
                <div className="mb-3">
                  {data.priceProblem > 0 && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-gray-600">문제지</span>
                      <span className="text-sm font-bold text-gray-900">{data.priceProblem.toLocaleString()}원</span>
                    </div>
                  )}
                  {data.priceEtc > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                      <span className="text-xs text-gray-600">기타(답지 등)</span>
                      <span className="text-sm font-bold text-gray-900">{data.priceEtc.toLocaleString()}원</span>
                    </div>
                  )}
                  {data.priceProblem === 0 && data.priceEtc === 0 && (
                    <p className="text-xs text-gray-300 text-center py-1">가격 미입력</p>
                  )}
                </div>
                <button className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-70 cursor-default">
                  <ExternalLink size={15} />
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
