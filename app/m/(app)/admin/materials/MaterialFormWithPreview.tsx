'use client';

import { useState } from 'react';
import MaterialForm from './MaterialForm';
import MaterialPreview from './MaterialPreview';

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
  difficulty:      3,
  difficultyRating:1000,
  fileType:        'pdf',
  targetAudience: 'student',
  isFree:         false,
  priceProblem:   0,
  priceEtc:       0,
  isActive:       true,
};

export default function MaterialFormWithPreview({
  mode,
  initialData,
}: {
  mode: 'create' | 'edit';
  initialData?: MaterialFormData;
}) {
  const [preview, setPreview] = useState<MaterialFormData>(initialData || defaultForm);

  return (
    <div className="grid xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] gap-6 2xl:gap-8 items-start">
      {/* 좌측: 등록 폼 */}
      <div>
        <MaterialForm
          mode={mode}
          initialData={initialData}
          onFormChange={setPreview}
        />
      </div>

      {/* 우측: 실시간 미리보기 */}
      <div className="sticky top-24">
        <div className="rounded-2xl border border-blue-100/80 bg-white/90 shadow-sm p-4 sm:p-5">
          <MaterialPreview data={preview} />
        </div>
      </div>
    </div>
  );
}
