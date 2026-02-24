import { buildMaterialTitle } from '@/lib/material-display';
import { MATERIAL_LIST_DIFF_STYLE } from '@/lib/material-difficulty-style';

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

export const diffStyle: Record<string, string> = MATERIAL_LIST_DIFF_STYLE;

export function rankStyle(rank: number) {
  if (rank === 1) return { box: 'bg-amber-50 border border-amber-200', text: 'text-amber-500' };
  if (rank === 2) return { box: 'bg-slate-50 border border-slate-200', text: 'text-slate-500' };
  if (rank === 3) return { box: 'bg-orange-50 border border-orange-200', text: 'text-orange-500' };
  return { box: 'bg-slate-50 border border-slate-200', text: 'text-slate-400' };
}

export const buildTitle = buildMaterialTitle;

export function isNewMaterial(createdAt?: Date | string | null) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}
