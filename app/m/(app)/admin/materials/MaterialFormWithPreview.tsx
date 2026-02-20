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
    <div className="grid xl:grid-cols-2 gap-8 items-start">
      {/* 좌측: 등록 폼 */}
      <div>
        <MaterialForm
          mode={mode}
          initialData={initialData}
          onFormChange={setPreview}
        />
      </div>

      {/* 우측: 실시간 미리보기 */}
      <div className="sticky top-6">
        <MaterialPreview data={preview} />
      </div>
    </div>
  );
}
