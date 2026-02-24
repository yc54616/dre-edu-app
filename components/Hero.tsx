'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const heroImages = [
    '/images/facility_lobby.jpg',
    '/images/facility_classroom.jpg',
    '/images/facility_classroom2.jpg',
    '/images/facility_study.jpg'
];

export default function Hero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, 150]);
    const y3 = useTransform(scrollY, [0, 500], [0, 100]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 6000); // Slower interval for better appreciation of the effect

        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-dre-gradient text-white pb-8 md:pb-20">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern z-20 opacity-30 pointer-events-none" />

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-noise z-20 opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                {/* Sophisticated Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-[var(--color-dre-blue)]/50 z-20" />

                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
                        style={{ backgroundImage: `url('${heroImages[currentImageIndex]}')` }}
                    />
                </AnimatePresence>
            </div>

            {/* Background Graphic Element (Optional) */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-white/5 blur-3xl opacity-50 mix-blend-overlay"
                />
                <motion.div
                    style={{ y: y2 }}
                    className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-dre-blue-light)]/20 blur-3xl opacity-50 mix-blend-overlay"
                />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center perspective-1000">
                <motion.div
                    style={{ y: y3, opacity }}
                    initial={{ opacity: 0, y: 30, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="relative z-10">
                        <h2 className="text-lg md:text-xl font-medium tracking-wider mb-6 text-blue-200 drop-shadow-md">
                            DRE MATH ACADEMY
                        </h2>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 md:mb-8 tracking-tight drop-shadow-xl">
                            수학은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white drop-shadow-none">전략</span>입니다<br className="hidden md:block" />
                            <span className="text-2xl md:text-4xl block mt-6 font-normal text-gray-100 drop-shadow-lg">
                                20년 현장 노하우로 완성된<br className="md:hidden" /> 정확한 진단과 처방
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                            무조건 많이 푸는 것만이 정답은 아닙니다.<br />
                            원장이 직접 강의하고 관리하는 DRE만의 시스템으로<br className="hidden md:block" />
                            아이에게 딱 맞는 공부 전략을 세워드립니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/admission"
                            className="group relative px-8 py-4 bg-white text-[var(--color-dre-blue)] rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10">1:1 정밀 진단 신청</span>
                            <div className="absolute inset-0 bg-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                        </Link>
                        <Link
                            href="#system"
                            className="px-8 py-4 border border-white/30 bg-white/5 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300"
                        >
                            시스템 자세히 보기
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
