import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';

const HIDDEN_SUBJECTS = new Set(['', '전자책']);
const BASE_SUBJECT_OPTIONS = [...MATERIAL_SUBJECTS];

const normalizeSubject = (value: unknown): string => (
  typeof value === 'string' ? value.trim() : ''
);

export async function getMaterialSubjectOptions(): Promise<string[]> {
  await connectMongo();

  const existingSubjects = await Material.distinct('subject', {
    subject: { $exists: true, $nin: ['', '전자책'] },
  });

  const baseSet = new Set(BASE_SUBJECT_OPTIONS);
  const extras = Array.from(
    new Set(
      existingSubjects
        .map((item) => normalizeSubject(item))
        .filter((item) => !!item && !HIDDEN_SUBJECTS.has(item) && !baseSet.has(item))
    )
  ).sort((a, b) => a.localeCompare(b, 'ko-KR'));

  return [...BASE_SUBJECT_OPTIONS, ...extras];
}
