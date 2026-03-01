'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import PolicyLinks from '@/components/m/PolicyLinks';
import {
  BookOpen, Sparkles, LayoutGrid, PlusCircle, LogOut,
  Menu, ShoppingBag, ClipboardList, UserCog, Home, Trophy, CreditCard, MessageSquare, Tag, CalendarClock, Megaphone, ChevronDown,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  userName: string;
  isAdmin: boolean;
  currentMode: 'teacher' | 'student';
  pendingTeacherCount?: number;
  pendingConsultationCount?: number;
  pendingScheduleCount?: number;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  exact?: boolean;
  matcher?: (path: string) => boolean;
};

function isNavActive(pathname: string, item: NavItem) {
  if (item.matcher) return item.matcher(pathname);
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const ADMIN_PRIMARY_COUNT = 7;

function formatBadgeCount(count: number) {
  return count > 99 ? '99+' : String(count);
}

/* ═══════════════════════════════════════════════════
   TopNav — 1:1 DRE Main Header.tsx style
   ═══════════════════════════════════════════════════ */
export default function TopNav({
  userName,
  isAdmin,
  currentMode,
  pendingTeacherCount = 0,
  pendingConsultationCount = 0,
  pendingScheduleCount = 0,
}: Props) {
  const pathname = usePathname();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [userMenuOpenPath, setUserMenuOpenPath] = useState<string | null>(null);
  const [moreOpenPath, setMoreOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;
  const userMenuOpen = userMenuOpenPath === pathname;
  const moreOpen = moreOpenPath === pathname;
  const showDesktopPolicyLinks = !isAdmin;
  const openMobileMenu = () => setMobileOpenPath(pathname);
  const closeMobileMenu = () => setMobileOpenPath(null);
  const toggleUserMenu = () => setUserMenuOpenPath((prev) => (prev === pathname ? null : pathname));
  const closeUserMenu = () => setUserMenuOpenPath(null);
  const toggleMoreMenu = () => setMoreOpenPath((prev) => (prev === pathname ? null : pathname));

  const navItems = useMemo<NavItem[]>(
    () => (isAdmin
      ? [
        {
          href: '/m/admin/materials', label: '자료 관리', icon: <LayoutGrid size={17} />,
          matcher: (path) => path.startsWith('/m/admin/materials') && !path.startsWith('/m/admin/materials/new'),
        },
        { href: '/m/admin/materials/new', label: '자료 등록', icon: <PlusCircle size={17} />, exact: true },
        { href: '/m/admin/orders', label: '주문 관리', icon: <ClipboardList size={17} /> },
        { href: '/m/admin/hall-of-fame', label: '명예의 전당 관리', icon: <Trophy size={17} /> },
        {
          href: '/m/admin/consultations',
          label: '상담 관리',
          icon: <MessageSquare size={17} />,
          badgeCount: pendingConsultationCount > 0 ? pendingConsultationCount : undefined,
        },
        {
          href: '/m/admin/schedule',
          label: '일정 관리',
          icon: <CalendarClock size={17} />,
          badgeCount: pendingScheduleCount > 0 ? pendingScheduleCount : undefined,
        },
        { href: '/m/admin/community-products', label: '상품 관리', icon: <Tag size={17} /> },
        { href: '/m/admin/community-upgrade-orders', label: '상품 결제 관리', icon: <CreditCard size={17} /> },
        {
          href: '/m/admin/users',
          label: '회원 관리',
          icon: <UserCog size={17} />,
          badgeCount: pendingTeacherCount > 0 ? pendingTeacherCount : undefined,
        },
        { href: '/m/admin/broadcast', label: '친구톡', icon: <Megaphone size={17} /> },
      ]
      : [
        {
          href: '/m/materials', label: currentMode === 'teacher' ? '교사용 자료' : '학생용 스토어', icon: <BookOpen size={17} />,
          matcher: (path) => path.startsWith('/m/materials') || path.startsWith('/m/purchase'),
        },
        { href: '/m/recommend', label: 'ELO 맞춤 추천', icon: <Sparkles size={17} /> },
        { href: '/m/my-orders', label: '내 구매 내역', icon: <ShoppingBag size={17} /> },
      ]),
    [isAdmin, currentMode, pendingTeacherCount, pendingConsultationCount, pendingScheduleCount]
  );

  const primaryNavItems = isAdmin ? navItems.slice(0, ADMIN_PRIMARY_COUNT) : navItems;
  const secondaryNavItems = isAdmin ? navItems.slice(ADMIN_PRIMARY_COUNT) : [];
  const hasSecondary = secondaryNavItems.length > 0;
  const secondaryHasActive = secondaryNavItems.some((item) => isNavActive(pathname, item));

  function renderNavLink(item: NavItem, active: boolean) {
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2.5 text-[13px] font-bold transition-colors xl:px-3 xl:text-sm ${active
          ? 'text-[var(--color-dre-blue)]'
          : 'text-gray-700 hover:text-[var(--color-dre-blue)]'
          }`}
      >
        {item.icon}
        <span>{item.label}</span>
        {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
          <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 py-[1px] text-[10px] font-extrabold leading-4 text-white">
            {formatBadgeCount(item.badgeCount)}
          </span>
        )}
      </Link>
    );
  }

  return (
    <>
      {/* ══ Header ══ */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={openMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[var(--color-dre-blue)] focus:outline-none lg:hidden"
                aria-label="메뉴 열기"
              >
                <Menu size={24} />
              </button>

              <Link href={isAdmin ? '/m/admin/materials' : '/m/materials'} className="flex items-center gap-2 whitespace-nowrap text-2xl font-bold text-[var(--color-dre-blue)]">
                <Image
                  src="/logo.png"
                  alt="DRE Logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-full"
                />
                DRE M
              </Link>
            </div>

            {/* Center Nav */}
            <nav className="hidden min-w-0 flex-1 px-3 lg:flex">
              <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {primaryNavItems.map((item) => renderNavLink(item, isNavActive(pathname, item)))}

                {/* 더보기 토글 버튼 */}
                {hasSecondary && (
                  <button
                    onClick={toggleMoreMenu}
                    className={`shrink-0 flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2.5 text-[13px] font-bold transition-colors xl:px-3 xl:text-sm ${moreOpen || secondaryHasActive
                      ? 'text-[var(--color-dre-blue)]'
                      : 'text-gray-700 hover:text-[var(--color-dre-blue)]'
                      }`}
                  >
                    더보기
                    <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </nav>

            {/* Right Side */}
            <div className="hidden shrink-0 items-center space-x-3 lg:flex">
              <div className={`${showDesktopPolicyLinks ? 'hidden 2xl:block' : 'hidden'}`}>
                <PolicyLinks textClassName="text-[11px] font-medium text-gray-400" />
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex max-w-[128px] items-center gap-2 rounded-full bg-[var(--color-dre-blue)] px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-800 hover:shadow-lg"
                >
                  <span className="truncate">{userName}</span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+4px)] w-48 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 z-[100]">
                    <div className="py-2">
                      <Link
                        href="/"
                        onClick={closeUserMenu}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)] transition-colors"
                      >
                        <Home size={15} />
                        DRE 홈
                      </Link>
                      <Link
                        href="/m/profile"
                        onClick={closeUserMenu}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)] transition-colors"
                      >
                        <UserCog size={15} />
                        내 정보
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/m' })}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)] transition-colors"
                      >
                        <LogOut size={15} />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile user button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleUserMenu}
                className="bg-[var(--color-dre-blue)] text-white font-bold px-3 py-1.5 rounded-full text-sm hover:bg-blue-800 transition-all shadow-md"
              >
                {userName.charAt(0)}
              </button>
              {userMenuOpen && (
                <div className="absolute right-4 top-14 w-48 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 z-[100]">
                  <div className="py-2">
                    <Link
                      href="/"
                      onClick={closeUserMenu}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)]"
                    >
                      <Home size={15} />
                      DRE 홈
                    </Link>
                    <Link
                      href="/m/profile"
                      onClick={closeUserMenu}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)]"
                    >
                      <UserCog size={15} />
                      내 정보
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/m' })} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)]">
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ 더보기 2단 행 (데스크탑) ══ */}
        <AnimatePresence>
          {moreOpen && hasSecondary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block overflow-hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-0.5 py-2">
                  {secondaryNavItems.map((item) => renderNavLink(item, isNavActive(pathname, item)))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══ Mobile Menu ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed top-16 left-0 right-0 z-40 lg:hidden bg-white border-b border-gray-100 overflow-hidden shadow-lg"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-bold transition-colors ${active
                        ? 'text-[var(--color-dre-blue)] bg-blue-50'
                        : 'text-gray-800 hover:text-[var(--color-dre-blue)] hover:bg-gray-50'
                        }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                        <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 py-[1px] text-[10px] font-extrabold leading-4 text-white">
                          {formatBadgeCount(item.badgeCount)}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-4 pb-2">
                  <div className="mb-3 flex justify-center">
                    <PolicyLinks className="justify-center" />
                  </div>
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="block w-full text-center bg-[var(--color-dre-blue)] text-white px-4 py-3 rounded-md text-base font-medium hover:bg-[var(--color-dre-blue-dark)]"
                  >
                    DRE 메인 사이트
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
