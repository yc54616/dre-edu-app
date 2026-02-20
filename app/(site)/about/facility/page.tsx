'use client';

import PageHero from '@/components/PageHero';
import FacilityDetail from '@/components/FacilityDetail';

export default function FacilityPage() {
    return (
        <main className="bg-white">
            <PageHero
                title="시설 안내 & 오시는 길"
                subtitle="SPACE & LOCATION"
                description="꿈을 이루는 프리미엄 학습 공간과 DRE로 오시는 길을 안내합니다."
                bgImage="/images/study_area.png"
            />
            <FacilityDetail />
        </main>
    );
}
