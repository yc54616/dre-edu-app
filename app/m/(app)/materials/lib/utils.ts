import { buildMaterialTitle } from '@/lib/material-display';

export type MaterialCardData = {
  materialId: string;
  sourceCategory?: string;
  publisher?: string | null;
  bookTitle?: string | null;
  subject: string;
  type: string;
  topic?: string | null;
  schoolLevel?: string | null;
  schoolName?: string | null;
  year?: number | null;
  gradeNumber?: number | null;
  semester?: number | null;
  fileType: string;
  difficulty: number;
  isFree?: boolean;
  priceProblem?: number;
  priceEtc?: number;
  downloadCount?: number;
  previewImages?: string[];
  createdAt?: Date | string | null;
};

export const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
  violet: 'bg-violet-100 text-violet-700 border border-violet-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
  red: 'bg-red-100 text-red-700 border border-red-200',
};

export function rankStyle(rank: number) {
  if (rank === 1) return { box: 'bg-amber-50 border border-amber-200', text: 'text-amber-500' };
  if (rank === 2) return { box: 'bg-slate-50 border border-slate-200', text: 'text-slate-500' };
  if (rank === 3) return { box: 'bg-orange-50 border border-orange-200', text: 'text-orange-500' };
  return { box: 'bg-slate-50 border border-slate-200', text: 'text-slate-400' };
}

export function buildTitle(m: {
  sourceCategory?: string;
  publisher?: string | null;
  bookTitle?: string | null;
  schoolName?: string | null;
  schoolLevel?: string | null;
  year?: number | null;
  gradeNumber?: number | null;
  semester?: number | null;
  subject: string;
  topic?: string | null;
}) {
  return buildMaterialTitle(m);
}

export function isNewMaterial(createdAt?: Date | string | null) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}
