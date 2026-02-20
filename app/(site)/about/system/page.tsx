'use client';

import PageHero from '@/components/PageHero';
import SystemDetail from '@/components/SystemDetail';

export default function SystemPage() {
    return (
        <main className="bg-white">
            <PageHero
                title="DRE 학습 시스템"
                subtitle="DRE SYSTEM"
                description="꿈을 현실로 만드는 DRE만의 체계적인 10단계 학습 프로세스"
                bgImage="/images/classroom_1.png"
            />
            <SystemDetail />

        </main>
    );
}
