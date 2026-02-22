'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Calculator, PieChart, TrendingUp, Sigma, BarChart2, Hexagon, MoreHorizontal, Layers,
} from 'lucide-react';

const items = [
    { key: '', label: '전체', icon: <Layers size={20} /> },
    { key: '수학(공통)', label: '공통', icon: <Calculator size={20} /> },
    { key: '수학I', label: '수학I', icon: <TrendingUp size={20} /> },
    { key: '수학II', label: '수학II', icon: <Sigma size={20} /> },
    { key: '미적분', label: '미적분', icon: <PieChart size={20} /> },
    { key: '확률과통계', label: '확통', icon: <BarChart2 size={20} /> },
    { key: '기하', label: '기하', icon: <Hexagon size={20} /> },
    { key: '기타', label: '기타', icon: <MoreHorizontal size={20} /> },
];

export default function QuickCategoryNav() {
    const searchParams = useSearchParams();
    const activeSubject = searchParams.get('subject') || '';

    const buildUrl = (subject: string) => {
        const params = new URLSearchParams();
        if (subject) params.set('subject', subject);
        params.set('page', '1');
        const sort = searchParams.get('sort');
        if (sort) params.set('sort', sort);
        const q = searchParams.get('q');
        if (q) params.set('q', q);
        return `/m/materials?${params.toString()}`;
    };

    return (
        <div className="py-8">
            <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-2">
                {items.map((s, idx) => {
                    const isActive = activeSubject === s.key;

                    return (
                        <motion.div
                            key={s.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.06, duration: 0.5 }}
                        >
                            <Link
                                href={buildUrl(s.key)}
                                className="flex flex-col items-center gap-2 group shrink-0"
                            >
                                {/* Icon circle — glass-card style on inactive, DRE blue on active */}
                                <motion.div
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive
                                        ? 'bg-[var(--color-dre-blue)] text-white shadow-lg'
                                        : 'glass-card text-gray-500 group-hover:text-[var(--color-dre-blue)] group-hover:border-blue-200'
                                        }`}
                                >
                                    {s.icon}
                                </motion.div>
                                <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-[var(--color-dre-blue)]' : 'text-gray-500 group-hover:text-[var(--color-dre-blue)]'
                                    }`}>
                                    {s.label}
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
