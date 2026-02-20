'use client';

import PageHero from '@/components/PageHero';
import PhilosophyDetail from '@/components/PhilosophyDetail';

export default function PhilosophyPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="교육 철학"
                subtitle="PHILOSOPHY"
                description="DRE가 생각하는 올바른 교육의 가치입니다."
                bgImage="/images/classroom_2.png"
            />
            <PhilosophyDetail />
        </main>
    );
}
