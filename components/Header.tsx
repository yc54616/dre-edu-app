
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const navigation = [
        {
            name: 'DRE 시스템',
            href: '/about/system',
            dropdown: [
                { name: 'DRE 시스템', href: '/about/system' },
                { name: '원장 소개', href: '/about/director' },
                { name: '교육 철학', href: '/about/philosophy' },
                { name: '시설 안내/오시는 길', href: '/about/facility' },
            ]
        },
        { name: '커리큘럼', href: '/curriculum' },
        {
            name: '코칭 안내',
            href: '/coaching/consulting',
            dropdown: [
                { name: '입시컨설팅', href: '/coaching/consulting' },
                { name: '수업 설계 컨설팅', href: '/coaching/teacher' },
                { name: '온라인 수학 코칭', href: '/coaching/math' },
            ]
        },
        { name: '명예의 전당', href: '/hall-of-fame' },
        { name: '커뮤니티', href: '/community' },
        { name: '입학 안내/신청', href: '/admission' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300 hover:bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[var(--color-dre-blue)]">
                            <Image
                                src="/logo.png"
                                alt="DRE Logo"
                                width={32}
                                height={32}
                                className="object-cover rounded-full"
                            />
                            DRE 수학
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <div
                                key={item.name}
                                className="relative group"
                                onMouseEnter={() => setDropdownOpen(item.name)}
                                onMouseLeave={() => setDropdownOpen(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="text-gray-700 hover:text-[var(--color-dre-blue)] px-4 py-3 rounded-md text-sm font-bold transition-colors flex items-center"
                                >
                                    {item.name}
                                    {item.dropdown && (
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.dropdown && (
                                    <div className={`absolute left-0 w-48 bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-200 border border-gray-100 ${dropdownOpen === item.name ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                                        <div className="py-2">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--color-dre-blue)] transition-colors"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* DRE M Button */}
                        <Link
                            href="/m"
                            className="bg-[var(--color-dre-blue)] text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-blue-800 transition-all shadow-md hover:shadow-lg flex items-center transform hover:scale-105"
                        >
                            DRE M (자료실)
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[var(--color-dre-blue)] focus:outline-none"
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
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => !item.dropdown && setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-bold text-gray-800 hover:text-[var(--color-dre-blue)] hover:bg-gray-50"
                                    >
                                        {item.name}
                                    </Link>
                                    {item.dropdown && (
                                        <div className="pl-6 space-y-1 mt-1 bg-gray-50/50 rounded-lg">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[var(--color-dre-blue)]"
                                                >
                                                    - {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 pb-2">
                                <Link
                                    href="/m"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-[var(--color-dre-blue)] text-white px-4 py-3 rounded-md text-base font-medium hover:bg-[var(--color-dre-blue-dark)]"
                                >
                                    DRE M (자료실)
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
