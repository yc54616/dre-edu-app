'use client';

import PageHero from '@/components/PageHero';
import ConsultingDetail from '@/components/ConsultingDetail';

export default function ConsultingPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="입시 코칭"
                subtitle="CONSULTING"
                description="성공적인 입시를 위한 개인별 맞춤 로드맵 설계"
                bgImage="/images/classroom_1.png"
            />
            <ConsultingDetail />
        </main>
    );
}
