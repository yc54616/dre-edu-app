import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SocialConnect from '@/components/SocialConnect';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <SocialConnect />
    </>
  );
}
