import Link from 'next/link';
import { BookOpen, ClipboardCheck, ExternalLink, Instagram, PhoneCall, Users } from 'lucide-react';
import PageHero from '@/components/PageHero';
import CommunityUpgradePayment from '@/components/CommunityUpgradePayment';
import ScrollReveal from '@/components/ScrollReveal';
import { getActiveProducts } from '@/lib/community-upgrade';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NAVER_CAFE_URL = process.env.NEXT_PUBLIC_DRE_NAVER_CAFE_URL || 'https://cafe.naver.com/dremath';
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || process.env.TOSS_CLIENT_KEY || '';

const COMMUNITY_CHANNELS = [
  {
    title: '네이버 카페',
    description: '등업/특강 공지와 학습 자료 공지사항을 확인하세요.',
    href: NAVER_CAFE_URL,
    icon: Users,
    accent: 'text-[#03C75A]',
  },
  {
    title: '네이버 블로그',
    description: '입시 소식, 학습 전략, DRE 공지사항을 확인하세요.',
    href: 'https://blog.naver.com/dre_institute',
    icon: BookOpen,
    accent: 'text-[#03C75A]',
  },
  {
    title: '인스타그램',
    description: '학원 소식과 현장 분위기를 빠르게 확인하세요.',
    href: 'https://www.instagram.com/dre_math2023/',
    icon: Instagram,
    accent: 'text-[#E1306C]',
  },
  {
    title: '전화 상담',
    description: '빠른 문의가 필요하면 바로 전화로 상담하세요.',
    href: 'tel:050713461125',
    icon: PhoneCall,
    accent: 'text-emerald-600',
  },
  {
    title: '1:1 정밀 진단 신청',
    description: '현재 실력 분석과 학습 방향 상담을 신청하세요.',
    href: '/admission',
    icon: ClipboardCheck,
    accent: 'text-blue-600',
  },
];

export default async function CommunityPage() {
  let paymentProducts: Array<{ key: string; name: string; shortLabel: string; amount: number }> = [];
  try {
    const products = await getActiveProducts();
    paymentProducts = products.map((product) => ({
      key: product.key,
      name: product.name,
      shortLabel: product.shortLabel,
      amount: product.amount,
    }));
  } catch (error) {
    console.error('[CommunityPage] failed to load community products', error);
  }

  return (
    <main className="bg-white">
      <PageHero
        title="커뮤니티"
        subtitle="DRE COMMUNITY"
        description="카페, 블로그, 인스타그램, 상담 채널을 한 곳에서 확인하세요."
        bgImage="/images/facility_study2.jpg"
      />

      <section className="relative overflow-hidden bg-gray-50 py-10 md:py-20 lg:py-24">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-8 text-center md:mb-14 lg:mb-16">
            <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-[var(--color-dre-blue)]">
              Community Channels
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">DRE 공식 채널</h2>
            <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-gray-600 sm:mt-4 sm:text-base md:text-lg">
              학원 소식, 입시 정보, 상담 연결까지 필요한 채널을 빠르게 이동할 수 있습니다.
            </p>
          </ScrollReveal>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6">
            {COMMUNITY_CHANNELS.map((channel, idx) => {
              const Icon = channel.icon;
              const isExternal = channel.href.startsWith('http') || channel.href.startsWith('tel:');

              return (
                <ScrollReveal key={channel.title} delay={0.05 * idx}>
                  <Link
                    href={channel.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="group flex h-full items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md sm:gap-4 sm:p-5 md:p-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 sm:h-11 sm:w-11 md:h-12 md:w-12">
                      <Icon size={20} className={channel.accent} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 sm:text-[19px] md:text-xl">{channel.title}</h3>
                        {isExternal && (
                          <ExternalLink size={15} className="text-gray-400 transition-colors group-hover:text-blue-500 sm:size-4" />
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-500 sm:mt-2 sm:text-[15px] md:text-base">{channel.description}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-8 md:mb-12 lg:mb-14">
            <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-[var(--color-dre-blue)]">
              Purchase Guide
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">상품 결제 안내</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-600 sm:mt-4 sm:text-base md:text-lg">
              네이버 카페 등업과 온라인 특강 등 필요한 상품을 선택해 결제할 수 있습니다.
            </p>
          </ScrollReveal>
        </div>
        <ScrollReveal>
          <CommunityUpgradePayment
            tossClientKey={TOSS_CLIENT_KEY}
            cafeUrl={NAVER_CAFE_URL}
            products={paymentProducts}
          />
        </ScrollReveal>
      </section>
    </main>
  );
}
