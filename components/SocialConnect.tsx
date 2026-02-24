'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, Instagram, BookOpen, ClipboardCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function SocialConnect() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);
    const cafeUrl = process.env.NEXT_PUBLIC_DRE_NAVER_CAFE_URL || 'https://cafe.naver.com/dremath';

    const menuItems = [
        {
            icon: <Phone size={20} />,
            label: '전화 상담',
            href: 'tel:050713461125',
            color: 'bg-green-500',
            delay: 0.1
        },
        {
            icon: <Users size={20} />,
            label: '카페 바로가기',
            href: cafeUrl,
            color: 'bg-[#03C75A]',
            delay: 0.18
        },
        {
            icon: <BookOpen size={20} />,
            label: '블로그',
            href: 'https://blog.naver.com/dre_institute', // Replace with actual URL
            color: 'bg-green-600', // Naver Green
            delay: 0.26
        },
        {
            icon: <Instagram size={20} />,
            label: '인스타그램',
            href: 'https://www.instagram.com/dre_math2023/',
            color: 'bg-pink-500',
            delay: 0.34
        },
        {
            icon: <ClipboardCheck size={20} />, // Use ClipboardCheck for Diagnosis
            label: '1:1 정밀 진단 신청',
            href: '/admission',
            color: 'bg-[var(--color-dre-blue)]',
            delay: 0.42
        }
    ];

    return (
        <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <div className="mb-4 flex flex-col items-end space-y-3">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ duration: 0.2, delay: item.delay }}
                                className="flex items-center space-x-3 pointer-events-auto"
                            >
                                <span className="bg-white text-gray-800 text-sm font-bold py-1 px-3 rounded-lg shadow-md">
                                    {item.label}
                                </span>
                                <Link
                                    href={item.href}
                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                    className={`${item.color} text-white p-3 rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center`}
                                >
                                    {item.icon}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleOpen}
                className={`p-4 rounded-full shadow-xl text-white font-bold transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-gray-800 rotate-45' : 'bg-dre-gradient hover:scale-110'}`}
                whileTap={{ scale: 0.9 }}
            >
                <Plus size={28} />
            </motion.button>
        </div>
    );
}
