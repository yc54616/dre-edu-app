'use client';

import PageHero from '@/components/PageHero';
import CoachingDetail from '@/components/CoachingDetail';

export default function ClassCoachingPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="온라인 코칭 & 상담"
                subtitle="ONLINE COACHING"
                description="언제 어디서나 DRE 전문 강사진의 밀착 코칭을 받아보세요."
                bgImage="/images/classroom_2.png"
            />
            <CoachingDetail />
        </main>
    );
}
