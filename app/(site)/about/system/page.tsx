'use client';

import PageHero from '@/components/PageHero';
import SystemDetail from '@/components/SystemDetail';

export default function SystemPage() {
    return (
        <main className="bg-white">
            <PageHero
                title="DRE 학습 시스템"
                subtitle="DRE SYSTEM"
                description="매일 반복하는 DRE 10단계 학습 과정"
                bgImage="/images/facility_lobby.jpg"
            />
            <SystemDetail />

        </main>
    );
}
