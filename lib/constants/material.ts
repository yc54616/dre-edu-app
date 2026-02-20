// Browser-safe constants — no mongoose import here

export const FILE_TYPES = ['pdf', 'hwp', 'both'] as const;
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

export type FileType = typeof FILE_TYPES[number];
export type TargetAudience = typeof TARGET_AUDIENCES[number];

export const MATERIAL_SUBJECTS = [
  '수학(공통)', '수학I', '수학II', '미적분', '확률과통계', '기하', '기타',
] as const;

export const MATERIAL_TYPES = [
  '수능기출', '모의고사', '내신', '개념', '심화', '킬러', '실전',
] as const;

export const SCHOOL_LEVELS = ['중학교', '고등학교'] as const;

export const TOPIC_MAP: Record<string, string[]> = {
  '수학(공통)': ['다항식', '방정식과 부등식', '도형의 방정식', '집합과 명제', '함수'],
  '수학I':      ['지수와 로그', '지수함수와 로그함수', '삼각함수', '수열'],
  '수학II':     ['함수의 극한과 연속', '다항함수의 미분법', '다항함수의 적분법'],
  '미적분':     ['수열의 극한', '미분법', '적분법'],
  '확률과통계': ['경우의 수', '확률', '통계'],
  '기하':       ['이차곡선', '평면벡터', '공간도형과 공간벡터'],
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
