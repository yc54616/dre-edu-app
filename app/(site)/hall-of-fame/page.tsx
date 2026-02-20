'use client';

import PageHero from '@/components/PageHero';
import HallOfFameDetail from '@/components/HallOfFameDetail';

export default function HallOfFamePage() {
    return (
        <main className="bg-white">
            <PageHero
                title="명예의 전당"
                subtitle="HALL OF FAME"
                description="DRE와 함께 놀라운 성장을 이뤄낸 학생들의 이야기"
                bgImage="/images/study_area.png"
            />
            <HallOfFameDetail />
        </main>
    );
}
