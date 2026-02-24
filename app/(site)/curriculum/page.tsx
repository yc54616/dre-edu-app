'use client';

import PageHero from '@/components/PageHero';
import CurriculumDetail from '@/components/CurriculumDetail';

export default function CurriculumPage() {
    return (
        <main className="bg-white">
            <PageHero
                title="과정별 커리큘럼"
                subtitle="CURRICULUM"
                description="중등 기초부터 고등 심화/입시까지 빈틈없는 로드맵"
                bgImage="/images/facility_study.jpg"
            />
            <CurriculumDetail />
        </main>
    );
}
