'use client';

import PageHero from '@/components/PageHero';
import PhilosophyDetail from '@/components/PhilosophyDetail';

export default function PhilosophyPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="교육 철학"
                subtitle="PHILOSOPHY"
                description="DRE가 중요하게 생각하는 교육의 방향입니다."
                bgImage="/images/facility_classroom3.jpg"
            />
            <PhilosophyDetail />
        </main>
    );
}
