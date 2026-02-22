'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, User, LogOut, BookOpen, Sparkles, ShoppingBag, LayoutGrid, PlusCircle, ClipboardList, UserCog, GraduationCap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    userName: string;
    userRole: string;
    isAdmin: boolean;
    currentMode: 'teacher' | 'student';
}

export default function HeaderM({ userName, userRole, isAdmin, currentMode }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    const toggleMode = () => {
        const next = currentMode === 'teacher' ? 'student' : 'teacher';
        document.cookie = `dre-mode=${next}; path=/; max-age=86400`;
        router.push('/m/materials');
        router.refresh();
    };

    const navItems = isAdmin ? [
        { name: '전체 자료 관리', href: '/m/admin/materials', icon: <LayoutGrid size={18} /> },
        { name: '자료 등록', href: '/m/admin/materials/new', icon: <PlusCircle size={18} /> },
        { name: '주문 관리', href: '/m/admin/orders', icon: <ClipboardList size={18} /> },
        { name: '회원 관리', href: '/m/admin/users', icon: <UserCog size={18} /> },
    ] : [
        { name: currentMode === 'teacher' ? '교사용 최상위 자료' : '학생용 프리미엄 자료', href: '/m/materials', icon: <BookOpen size={18} /> },
        { name: 'AI 맞춤 추천', href: '/m/recommend', icon: <Sparkles size={18} /> },
        { name: '내 주문 내역', href: '/m/my-orders', icon: <ShoppingBag size={18} /> },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <Link href={isAdmin ? '/m/admin/materials' : '/m/materials'} className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                                <span className="text-white font-black text-lg">M</span>
                            </div>
                            <span className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">DRE M</span>
                        </Link>

                        <div className="hidden sm:flex items-center gap-2 ml-2 border-l border-gray-200 pl-4">
                            {isAdmin ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">
                                    관리자 모드
                                </span>
                            ) : (
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentMode === 'teacher'
                                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                                        : 'bg-blue-50 text-blue-600 border-blue-200'
                                    }`}>
                                    {currentMode === 'teacher' ? '교사용 모드' : '학생용 모드'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/m/admin/materials/new' && pathname.startsWith(item.href) && item.href !== '/m/materials' && item.href !== '/m/admin/materials');
                            // Special case for materials to avoid matching everything
                            const isExactMatch = pathname === item.href;
                            const isSubPathMatch = pathname.startsWith(item.href + '/');
                            const finalActive = isActive || isExactMatch || isSubPathMatch;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${finalActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Area (User Profile / Toggle) */}
                    <div className="hidden lg:flex items-center gap-3">
                        {!isAdmin && userRole === 'teacher' && (
                            <button
                                onClick={toggleMode}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${currentMode === 'teacher'
                                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                            >
                                {currentMode === 'teacher' ? <Users size={14} /> : <GraduationCap size={14} />}
                                {currentMode === 'teacher' ? '학생 모드로 전환' : '교사 모드로 전환'}
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-100 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-red-50 text-red-600' : currentMode === 'teacher' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {userName.charAt(0) || 'U'}
                                </div>
                                <span className="text-sm font-bold text-gray-700">{userName}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-black text-gray-900">{userName}</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                                    {userRole === 'admin' ? '관리자 그룹' : userRole === 'teacher' ? '선생님 그룹' : '학생 그룹'}
                                                </p>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/" className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                    <BookOpen size={16} />
                                                    DRE 메인 사이트
                                                </Link>
                                                <button
                                                    onClick={() => signOut({ callbackUrl: '/m' })}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    로그아웃
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {/* User Profile Mobile */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isAdmin ? 'bg-red-100 text-red-600' : currentMode === 'teacher' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {userName.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{userName}</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase">
                                        {userRole === 'admin' ? '관리자' : userRole === 'teacher' ? '선생님' : '학생'}
                                    </p>
                                </div>
                            </div>

                            {/* Mode Toggle Mobile */}
                            {!isAdmin && userRole === 'teacher' && (
                                <button
                                    onClick={toggleMode}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-gray-100"
                                >
                                    {currentMode === 'teacher' ? <Users size={16} /> : <GraduationCap size={16} />}
                                    {currentMode === 'teacher' ? '학생 모드로 전환하여 보기' : '교사 모드로 전환하여 보기'}
                                </button>
                            )}

                            {/* Nav Items Mobile */}
                            <div className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <span className="text-gray-400">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-1">
                                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                                    <BookOpen size={18} className="text-gray-400" />
                                    DRE 메인 사이트 이동
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/m' })}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
                                >
                                    <LogOut size={18} className="text-red-400" />
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
