'use client';

import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    subtitle: string;
    bgImage?: string;
    description?: string;
}

export default function PageHero({ title, subtitle, bgImage = '/images/facility_classroom.jpg', description }: PageHeroProps) {
    return (
        <section className="relative flex h-[260px] items-center justify-center overflow-hidden sm:h-[300px] md:h-[380px] lg:h-[420px]">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-dre-gradient-dark opacity-70 z-10 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/10 z-10" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern z-10 opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Content */}
            <div className="relative z-20 mx-auto max-w-4xl px-5 text-center sm:px-6">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-3 inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200 backdrop-blur-md sm:mb-4 sm:text-sm"
                >
                    {subtitle}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-4 text-2xl font-bold leading-tight text-white drop-shadow-lg sm:text-3xl md:mb-6 md:text-5xl"
                >
                    {title}
                </motion.h1>
                {description && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-200 sm:text-base md:text-lg"
                    >
                        {description}
                    </motion.p>
                )}
            </div>
        </section>
    );
}
