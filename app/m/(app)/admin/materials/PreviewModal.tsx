'use client';

import { useState } from 'react';
import {
  Eye, X, BookOpen, Download, ExternalLink,
  Lock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR, FILE_TYPE_LABEL, TARGET_AUDIENCE_LABEL } from '@/lib/constants/material';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  red:     'bg-red-100 text-red-700 border-red-200',
};

interface MaterialPreview {
  materialId:     string;
  type:           string;
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

  const title = [
    material.schoolName,
    material.year       ? `${material.year}년`       : '',
    material.gradeNumber ? `${material.gradeNumber}학년` : '',
    material.semester   ? `${material.semester}학기`  : '',
    material.subject,
    material.topic,
  ].filter(Boolean).join(' ');

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
                          <img
                            src={`/uploads/previews/${imgs[imgIdx]}`}
                            alt="미리보기"
                            className="w-full h-full object-cover"
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
                            className={`w-10 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                              i === imgIdx ? 'border-[var(--color-dre-blue)]' : 'border-gray-100 hover:border-gray-300'
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
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diffStyle[dc] || diffStyle.blue}`}>
                        {DIFFICULTY_LABEL[material.difficulty] || '표준'}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{material.type}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        material.fileType === 'hwp' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                      }`}>{FILE_TYPE_LABEL[material.fileType] || 'PDF'}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        material.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                      }`}>{TARGET_AUDIENCE_LABEL[material.targetAudience] || '학생용'}</span>
                      {material.isFree && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">FREE</span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{title || material.subject}</h2>

                    <div className="space-y-2 text-sm">
                      {[
                        { label: '과목',  value: material.subject },
                        { label: '단원',  value: material.topic || '-' },
                        { label: '학교급', value: material.schoolLevel },
                        { label: '학년',  value: material.gradeNumber ? `${material.gradeNumber}학년` : '-' },
                        { label: '학교',  value: material.schoolName || '-' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
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
