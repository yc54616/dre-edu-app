'use client';

import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    subtitle: string;
    bgImage?: string;
    description?: string;
}

export default function PageHero({ title, subtitle, bgImage = '/images/classroom_1.png', description }: PageHeroProps) {
    return (
        <section className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
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
            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-sm font-bold mb-4 backdrop-blur-md"
                >
                    {subtitle}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
                >
                    {title}
                </motion.h1>
                {description && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed"
                    >
                        {description}
                    </motion.p>
                )}
            </div>
        </section>
    );
}
