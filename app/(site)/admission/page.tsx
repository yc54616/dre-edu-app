'use client';

import PageHero from '@/components/PageHero';
import AdmissionDetail from '@/components/AdmissionDetail';

export default function AdmissionPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="입학 안내 & 정밀 진단"
                subtitle="ADMISSION"
                description="정확한 진단이 올바른 학습의 시작입니다."
                bgImage="/images/facility_lobby.jpg"
            />
            <AdmissionDetail />
        </main>
    );
}
