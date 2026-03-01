const MATERIAL_SOURCE_CATEGORIES = ['school_exam', 'textbook', 'reference', 'ebook'];
const normalizeSourceCategory = (value) => (
  typeof value === 'string' && MATERIAL_SOURCE_CATEGORIES.includes(value)
    ? value
    : 'school_exam'
);
const TEXTBOOK_TYPES = ['교과서 개념', '본문 분석', '단원평가', '서술형', '내신 변형'];
const REFERENCE_TYPES = ['개념서', '유형서', '심화서', '실전서', '오답정리'];

const textbookTypeHints = new Set(TEXTBOOK_TYPES);
const referenceTypeHints = new Set(REFERENCE_TYPES);

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeSourceCategoryWithHint = (sourceCategory, type, subject) => {
  const normalized = normalizeSourceCategory(sourceCategory);
  const normalizedType = normalizeText(type);
  if (normalizedType === '전자책' || subject === '전자책') return 'ebook';
  if (textbookTypeHints.has(normalizedType)) return 'textbook';
  if (referenceTypeHints.has(normalizedType)) return 'reference';
  return normalized;
};

console.log(normalizeSourceCategoryWithHint('reference', '유형서', '수학'));
