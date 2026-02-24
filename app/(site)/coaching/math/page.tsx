'use client';

import PageHero from '@/components/PageHero';
import CoachingDetail from '@/components/CoachingDetail';

export default function MathCoachingPage() {
  return (
    <main className="bg-white min-h-screen">
      <PageHero
        title="온라인 수학 코칭"
        subtitle="ONLINE MATH COACHING"
        description="학생의 현재 실력에 맞춰 진단하고, 수업과 과제 루틴까지 함께 관리합니다."
        bgImage="/images/facility_coaching.png"
      />
      <CoachingDetail />
    </main>
  );
}
