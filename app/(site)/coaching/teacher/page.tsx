'use client';

import PageHero from '@/components/PageHero';
import TeacherCoachingDetail from '@/components/TeacherCoachingDetail';

export default function TeacherCoachingPage() {
  return (
    <main className="bg-white min-h-screen">
      <PageHero
        title="수업 설계 컨설팅"
        subtitle="CLASS DESIGN CONSULTING"
        description="선생님 수업 흐름에 맞춰 단원 운영, 자료 구성, 피드백 루틴을 함께 정리합니다."
        bgImage="/images/facility_classroom2.jpg"
      />
      <TeacherCoachingDetail />
    </main>
  );
}
