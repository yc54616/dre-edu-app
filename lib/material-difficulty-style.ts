export type DifficultyTone = 'emerald' | 'blue' | 'violet' | 'orange' | 'red';
export type DifficultyBadgeVariant = 'softOutline' | 'strongOutline' | 'mixedTint' | 'softTint';

const DEFAULT_TONE: DifficultyTone = 'blue';

const DIFFICULTY_BADGE_CLASS: Record<DifficultyBadgeVariant, Record<DifficultyTone, string>> = {
  softOutline: {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  },
  strongOutline: {
    emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    violet: 'bg-violet-100 text-violet-700 border border-violet-200',
    orange: 'bg-orange-100 text-orange-700 border border-orange-200',
    red: 'bg-red-100 text-red-700 border border-red-200',
  },
  mixedTint: {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-100 text-violet-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  },
  softTint: {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  },
};

function isDifficultyTone(value: string): value is DifficultyTone {
  return value === 'emerald' || value === 'blue' || value === 'violet' || value === 'orange' || value === 'red';
}

export function getDifficultyBadgeClass(
  tone: string | null | undefined,
  variant: DifficultyBadgeVariant = 'softOutline',
): string {
  if (tone && isDifficultyTone(tone)) {
    return DIFFICULTY_BADGE_CLASS[variant][tone];
  }
  return DIFFICULTY_BADGE_CLASS[variant][DEFAULT_TONE];
}

export const MATERIAL_LIST_DIFF_STYLE = DIFFICULTY_BADGE_CLASS.strongOutline;
