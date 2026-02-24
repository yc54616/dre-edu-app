import PageHero from '@/components/PageHero';
import HallOfFameDetail from '@/components/HallOfFameDetail';
import connectMongo from '@/lib/mongoose';
import HallOfFameEntry from '@/lib/models/HallOfFameEntry';
import {
  clampReviewStars,
  type HallOfFameAdmission,
  type HallOfFameReview,
} from '@/lib/hall-of-fame';

export const dynamic = 'force-dynamic';

type HallOfFameEntryLean = {
  _id: unknown;
  entryId?: string;
  kind?: 'admission' | 'review';
  univ?: string;
  major?: string;
  student?: string;
  school?: string;
  badge?: string;
  desc?: string;
  name?: string;
  content?: string;
  tag?: string;
  stars?: number;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

async function getPublishedHallOfFameData(): Promise<{
  admissions: HallOfFameAdmission[];
  reviews: HallOfFameReview[];
}> {
  try {
    await connectMongo();
    const entries = await HallOfFameEntry.find({ isPublished: true })
      .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
      .lean() as HallOfFameEntryLean[];

    const admissions: HallOfFameAdmission[] = [];
    const reviews: HallOfFameReview[] = [];

    for (const entry of entries) {
      const id = entry.entryId || String(entry._id || '');
      if (!id) continue;

      if (entry.kind === 'admission') {
        const univ = normalizeText(entry.univ);
        const major = normalizeText(entry.major);
        const student = normalizeText(entry.student);
        const desc = normalizeText(entry.desc);
        if (!univ || !major || !student || !desc) continue;

        admissions.push({
          id,
          univ,
          major,
          student,
          school: normalizeText(entry.school),
          badge: normalizeText(entry.badge) || '수시 합격',
          desc,
        });
        continue;
      }

      if (entry.kind === 'review') {
        const name = normalizeText(entry.name);
        const content = normalizeText(entry.content);
        if (!name || !content) continue;

        reviews.push({
          id,
          name,
          content,
          tag: normalizeText(entry.tag) || '수강생',
          stars: clampReviewStars(entry.stars),
        });
      }
    }

    return { admissions, reviews };
  } catch (error) {
    console.error('[hall-of-fame/page] 공개 데이터 조회 실패', error);
    return { admissions: [], reviews: [] };
  }
}

export default async function HallOfFamePage() {
  const { admissions, reviews } = await getPublishedHallOfFameData();

  return (
    <main className="bg-white">
      <PageHero
        title="명예의 전당"
        subtitle="HALL OF FAME"
        description="DRE와 함께 놀라운 성장을 이뤄낸 학생들의 이야기"
        bgImage="/images/facility_study2.jpg"
      />
      <HallOfFameDetail admissions={admissions} reviews={reviews} />
    </main>
  );
}
