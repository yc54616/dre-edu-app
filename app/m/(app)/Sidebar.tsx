'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BookOpen, Sparkles, LayoutGrid, PlusCircle,
  LogOut, GraduationCap, Users, ShieldCheck,
  ExternalLink, Menu, X, ShoppingBag, ClipboardList, UserCog,
} from 'lucide-react';

interface Props {
  userName: string;
  userRole: string;
  isAdmin: boolean;
  currentMode: 'teacher' | 'student';
}

export default function Sidebar({ userName, userRole, isAdmin, currentMode }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggleMode = () => {
    const next = currentMode === 'teacher' ? 'student' : 'teacher';
    document.cookie = `dre-mode=${next}; path=/; max-age=86400`;
    router.push('/m/materials');
    router.refresh();
  };

  const sidebarContent = (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full z-20">
      {/* 로고 */}
      <div className="px-6 py-8 shrink-0">
        <div className="flex items-center justify-between">
          <Link
            href={isAdmin ? '/m/admin/materials' : '/m/materials'}
            className="flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">DRE M</span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                    <ShieldCheck size={10} />관리자
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    currentMode === 'teacher'
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'bg-blue-50 text-blue-600 border-blue-200'
                  }`}>
                    {currentMode === 'teacher' ? '교사용' : '학생용'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">수학은 전략입니다</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin ? (
          <>
            <p className="px-3 pb-2 pt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">자료 관리</p>
            <NavItem
              href="/m/admin/materials"
              icon={<LayoutGrid size={18} />}
              label="전체 자료 목록"
              active={pathname.startsWith('/m/admin/materials') && !pathname.includes('/new')}
            />
            <NavItem
              href="/m/admin/materials/new"
              icon={<PlusCircle size={18} />}
              label="자료 등록"
              active={pathname === '/m/admin/materials/new'}
            />
            <p className="px-3 pb-2 pt-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">주문 관리</p>
            <NavItem
              href="/m/admin/orders"
              icon={<ClipboardList size={18} />}
              label="주문 목록"
              active={pathname.startsWith('/m/admin/orders')}
            />
            <p className="px-3 pb-2 pt-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">회원 관리</p>
            <NavItem
              href="/m/admin/users"
              icon={<UserCog size={18} />}
              label="회원 목록 / 등록"
              active={pathname.startsWith('/m/admin/users')}
            />
          </>
        ) : (
          <>
            <p className="px-3 pb-2 pt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {currentMode === 'teacher' ? '교사용 자료' : '학생용 자료'}
            </p>
            <NavItem
              href="/m/materials"
              icon={<BookOpen size={18} />}
              label={currentMode === 'teacher' ? '자료 목록 (HWP)' : '자료 목록 (PDF)'}
              active={pathname.startsWith('/m/materials')}
            />
            <NavItem
              href="/m/recommend"
              icon={<Sparkles size={18} />}
              label="맞춤 추천"
              active={pathname === '/m/recommend'}
            />
            <p className="px-3 pb-2 pt-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">내 정보</p>
            <NavItem
              href="/m/my-orders"
              icon={<ShoppingBag size={18} />}
              label="내 주문 내역"
              active={pathname === '/m/my-orders'}
            />
          </>
        )}
      </nav>

      {/* 모드 전환 버튼 (교사 회원만) */}
      {!isAdmin && userRole === 'teacher' && (
        <div className="px-4 pb-4 shrink-0">
          <button
            onClick={toggleMode}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
              currentMode === 'teacher'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${currentMode === 'teacher' ? 'bg-blue-100' : 'bg-orange-100'}`}>
              {currentMode === 'teacher'
                ? <GraduationCap size={16} strokeWidth={2.5} />
                : <Users size={16} strokeWidth={2.5} />
              }
            </div>
            <span className="tracking-wide">
              {currentMode === 'teacher' ? '학생용 자료 보기' : '교사용 자료 보기'}
            </span>
          </button>
        </div>
      )}

      {/* 사용자 정보 & 링크 */}
      <div className="p-5 mt-auto border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
            isAdmin
              ? 'bg-red-50 text-red-500 border border-red-100'
              : currentMode === 'teacher'
                ? 'bg-orange-50 text-orange-500 border border-orange-100'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {userName.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-extrabold text-gray-900 truncate tracking-tight">{userName}</p>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              {userRole === 'admin' ? '관리자 계정' : userRole === 'teacher' ? '선생님 계정' : '학생 계정'}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-xl transition-all duration-200"
          >
            <ExternalLink size={15} strokeWidth={2.5} />
            DRE 홈
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/m' })}
            className="flex items-center justify-center p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 rounded-xl transition-all duration-200"
            title="로그아웃"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── 모바일 상단 바 ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-gray-900 text-base tracking-tight">DRE M</span>
        <div className="w-8" />
      </div>

      {/* ── 데스크탑 사이드바 ── */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </div>

      {/* ── 모바일 사이드바 드로어 ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden flex">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

function NavItem({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all duration-200 group ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`flex items-center justify-center ${
        active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 transition-colors'
      }`}>
        {icon}
      </span>
      <span className="tracking-wide">{label}</span>
    </Link>
  );
}
