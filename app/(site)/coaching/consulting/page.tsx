'use client';

import PageHero from '@/components/PageHero';
import ConsultingDetail from '@/components/ConsultingDetail';

export default function ConsultingPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="입시컨설팅"
                subtitle="CONSULTING"
                description="현재 성적과 목표를 바탕으로, 실제 지원 전략까지 함께 설계합니다."
                bgImage="/images/facility_coaching.png"
            />
            <ConsultingDetail />
        </main>
    );
}
