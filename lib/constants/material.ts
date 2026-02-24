// Browser-safe constants — no mongoose import here

export const FILE_TYPES = ['pdf', 'hwp', 'both'] as const;
export const MAX_PREVIEW_IMAGES = 2;

export const FILE_TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  hwp: 'HWP (한글)',
  both: 'PDF + HWP',
};

export const TARGET_AUDIENCES = ['student', 'teacher', 'all'] as const;
export const TARGET_AUDIENCE_LABEL: Record<string, string> = {
  student: '학생용',
  teacher: '교사용',
  all: '공통',
};

export const TEACHER_PRODUCT_TYPES = ['ebook', 'class_prep', 'naver_cert'] as const;
export type TeacherProductType = typeof TEACHER_PRODUCT_TYPES[number];

export const TEACHER_PRODUCT_TYPE_LABEL: Record<TeacherProductType, string> = {
  ebook: '전자책',
  class_prep: '수업준비자료',
  naver_cert: 'NAVER인증',
};

export type FileType = typeof FILE_TYPES[number];
export type TargetAudience = typeof TARGET_AUDIENCES[number];

export const MATERIAL_SOURCE_CATEGORIES = ['school_exam', 'textbook', 'reference', 'ebook'] as const;
export type MaterialSourceCategory = typeof MATERIAL_SOURCE_CATEGORIES[number];

export const MATERIAL_SOURCE_CATEGORY_LABEL: Record<MaterialSourceCategory, string> = {
  school_exam: '내신기출',
  textbook: '교과서',
  reference: '참고서',
  ebook: '전자책',
};

export const MATERIAL_CURRICULUMS = ['revised_2022', 'legacy'] as const;
export type MaterialCurriculum = typeof MATERIAL_CURRICULUMS[number];

export const MATERIAL_CURRICULUM_LABEL: Record<MaterialCurriculum, string> = {
  revised_2022: '2022 개정',
  legacy: '구과정',
};

export const REVISED_ONLY_MATERIAL_SUBJECTS = [
  '공통수학I', '공통수학II', '대수', '미적분1', '미적분2',
] as const;

export const LEGACY_ONLY_MATERIAL_SUBJECTS = [
  '수학(공통)', '수학I', '수학II', '미적분',
] as const;

export const SHARED_MATERIAL_SUBJECTS = [
  '확률과통계', '기하',
] as const;

export const REVISED_MATERIAL_SUBJECTS = [
  ...REVISED_ONLY_MATERIAL_SUBJECTS,
  ...SHARED_MATERIAL_SUBJECTS,
  '기타',
] as const;

export const LEGACY_MATERIAL_SUBJECTS = [
  ...LEGACY_ONLY_MATERIAL_SUBJECTS,
  ...SHARED_MATERIAL_SUBJECTS,
  '기타',
] as const;

export const MATERIAL_SUBJECTS_BY_CURRICULUM: Record<MaterialCurriculum, readonly string[]> = {
  revised_2022: REVISED_MATERIAL_SUBJECTS,
  legacy: LEGACY_MATERIAL_SUBJECTS,
};

export const MATERIAL_SUBJECTS = [
  ...REVISED_ONLY_MATERIAL_SUBJECTS,
  ...SHARED_MATERIAL_SUBJECTS,
  ...LEGACY_ONLY_MATERIAL_SUBJECTS,
  '기타',
] as const;

const LEGACY_SUBJECT_HINTS = new Set<string>([
  ...LEGACY_ONLY_MATERIAL_SUBJECTS,
  '수학1',
  '수학2',
  '수학(상)',
  '수학(하)',
]);

export function isSharedMaterialSubject(subject: unknown): boolean {
  return typeof subject === 'string' && SHARED_MATERIAL_SUBJECTS.includes(subject as typeof SHARED_MATERIAL_SUBJECTS[number]);
}

export function resolveMaterialCurriculumFromSubject(subject: unknown): MaterialCurriculum {
  if (typeof subject !== 'string') return 'revised_2022';
  const normalized = subject.trim();
  if (!normalized) return 'revised_2022';
  return LEGACY_SUBJECT_HINTS.has(normalized) ? 'legacy' : 'revised_2022';
}

export const MATERIAL_SUBJECT_ALIASES: Record<string, readonly string[]> = {
  공통수학I: ['공통수학1'],
  공통수학II: ['공통수학2'],
  공통수학1: ['공통수학I'],
  공통수학2: ['공통수학II'],
  수학I: ['수학1'],
  수학II: ['수학2'],
  수학1: ['수학I'],
  수학2: ['수학II'],
};

export function getMaterialSubjectFilterCandidates(subject: string): string[] {
  const normalized = subject.trim();
  if (!normalized) return [];
  const aliases = MATERIAL_SUBJECT_ALIASES[normalized] || [];
  return [...new Set([normalized, ...aliases])];
}

const SCHOOL_EXAM_TYPES = [
  '내신기출', '내신', '중간고사', '기말고사', '학력평가', '수능기출', '모의고사', '개념', '심화', '킬러', '실전',
] as const;

const TEXTBOOK_TYPES = [
  '교과서 개념', '본문 분석', '단원평가', '서술형', '내신 변형',
] as const;

const REFERENCE_TYPES = [
  '개념서', '유형서', '심화서', '실전서', '오답정리',
] as const;

const EBOOK_TYPES = [
  '전자책',
] as const;

export const MATERIAL_TYPES_BY_SOURCE: Record<MaterialSourceCategory, readonly string[]> = {
  school_exam: SCHOOL_EXAM_TYPES,
  textbook: TEXTBOOK_TYPES,
  reference: REFERENCE_TYPES,
  ebook: EBOOK_TYPES,
};

export const MATERIAL_TYPES = [
  ...SCHOOL_EXAM_TYPES,
  ...TEXTBOOK_TYPES,
  ...REFERENCE_TYPES,
  ...EBOOK_TYPES,
] as const;

export const TEACHER_CLASS_PREP_TYPES = [
  ...MATERIAL_TYPES,
  '수업준비자료',
] as const;
export type TeacherClassPrepType = typeof TEACHER_CLASS_PREP_TYPES[number];

export const TEACHER_CLASS_PREP_TYPE_LABEL: Record<TeacherClassPrepType, string> = Object.fromEntries(
  TEACHER_CLASS_PREP_TYPES.map((value) => [value, value])
) as Record<TeacherClassPrepType, string>;

export const LEGACY_TEACHER_CLASS_PREP_TYPES = ['textbook', 'reference', 'worksheet', 'assessment', 'other'] as const;
export type LegacyTeacherClassPrepType = typeof LEGACY_TEACHER_CLASS_PREP_TYPES[number];

export const LEGACY_TEACHER_CLASS_PREP_TO_CURRENT: Record<LegacyTeacherClassPrepType, TeacherClassPrepType> = {
  textbook: '교과서 개념',
  reference: '유형서',
  worksheet: '수업준비자료',
  assessment: '단원평가',
  other: '수업준비자료',
};

export const SCHOOL_LEVELS = ['중학교', '고등학교'] as const;

export const MAJOR_PUBLISHERS = [
  '비상교육', '천재교육', '미래엔', '지학사', '좋은책신사고', 'EBS', '대성',
] as const;

export const TOPIC_MAP: Record<string, string[]> = {
  '공통수학1':  ['다항식', '방정식과 부등식', '경우의 수', '행렬'],
  '공통수학2':  ['도형의 방정식', '집합과 명제', '함수', '통계'],
  '공통수학I':  ['다항식', '방정식과 부등식', '경우의 수', '행렬'],
  '공통수학II': ['도형의 방정식', '집합과 명제', '함수', '통계'],
  '대수':       ['지수와 로그', '지수함수와 로그함수', '삼각함수', '수열'],
  '미적분1':    ['수열의 극한', '함수의 극한과 연속', '미분법'],
  '확률과통계': ['경우의 수', '확률', '통계'],
  '기하':       ['이차곡선', '평면벡터', '공간도형과 공간벡터'],
  '미적분2':    ['적분법', '미분법 응용', '적분법 응용'],
  '수학(공통)': ['다항식', '방정식과 부등식', '도형의 방정식', '집합과 명제', '함수'],
  '수학I':      ['지수와 로그', '지수함수와 로그함수', '삼각함수', '수열'],
  '수학1':      ['지수와 로그', '지수함수와 로그함수', '삼각함수', '수열'],
  '수학II':     ['함수의 극한과 연속', '다항함수의 미분법', '다항함수의 적분법'],
  '수학2':      ['함수의 극한과 연속', '다항함수의 미분법', '다항함수의 적분법'],
  '미적분':     ['수열의 극한', '미분법', '적분법'],
  '수학(상)':   ['다항식', '방정식과 부등식', '도형의 방정식'],
  '수학(하)':   ['집합과 명제', '함수', '경우의 수'],
};

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: '기초', 2: '기본', 3: '표준', 4: '심화', 5: '최고난도',
};

export const DIFFICULTY_COLOR: Record<number, string> = {
  1: 'emerald', 2: 'blue', 3: 'violet', 4: 'orange', 5: 'red',
};

export type MaterialSubject = typeof MATERIAL_SUBJECTS[number];
export type MaterialType    = typeof MATERIAL_TYPES[number];
export type SchoolLevel     = typeof SCHOOL_LEVELS[number];
