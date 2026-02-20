import Hero from '@/components/Hero';
import SystemIntro from '@/components/SystemIntro';
import Facility from '@/components/Facility';
import DirectorIntro from '@/components/DirectorIntro';
import Curriculum from '@/components/Curriculum';
import Reviews from '@/components/Reviews';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <SystemIntro />
      <DirectorIntro />
      <Facility />
      <Curriculum />
      <Reviews />
    </main>
  );
}
