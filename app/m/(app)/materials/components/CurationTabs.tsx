'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, BookOpen, ShoppingBag } from 'lucide-react';
import { buildMaterialTitle } from '@/lib/material-display';

const NEW_BADGE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const RENDERED_AT = Date.now();

interface MaterialItem {
    materialId: string;
    sourceCategory?: string;
    publisher?: string | null;
    bookTitle?: string | null;
    subject: string;
    topic?: string | null;
    type: string;
    schoolName?: string | null;
    year?: number | null;
    gradeNumber?: number | null;
    semester?: number | null;
    difficulty: number;
    difficultyLabel: string;
    isFree?: boolean;
    priceProblem?: number;
    priceEtc?: number;
    previewImages?: string[];
    downloadCount?: number;
    fileType?: string;
    createdAt?: string;
}

export default function CurationTabs({
    top10,
    newMaterials,
}: {
    top10: MaterialItem[];
    newMaterials: MaterialItem[];
}) {
    const [activeTab, setActiveTab] = useState<'popular' | 'new'>('popular');
    const hasTop10 = top10.length > 0;
    const hasNew = newMaterials.length > 0;
    if (!hasTop10 && !hasNew) return null;

    const items = activeTab === 'popular' ? top10 : newMaterials;

    return (
        <section>
            {/* Tab buttons */}
            <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
                {hasTop10 && (
                    <button
                        onClick={() => setActiveTab('popular')}
                        className={`flex items-center gap-2 pb-3 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'popular'
                                ? 'text-[var(--color-dre-blue)] border-[var(--color-dre-blue)]'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                            }`}
                    >
                        <Flame size={17} />
                        인기 TOP 10
                    </button>
                )}
                {hasNew && (
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex items-center gap-2 pb-3 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'new'
                                ? 'text-[var(--color-dre-blue)] border-[var(--color-dre-blue)]'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                            }`}
                    >
                        <Clock size={17} />
                        신규 자료
                    </button>
                )}
            </div>

            {/* Card grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                >
                    {items.slice(0, 10).map((m, idx) => {
                        const title = buildMaterialTitle(m);
                        const isNew = m.createdAt && (RENDERED_AT - new Date(m.createdAt).getTime()) < NEW_BADGE_WINDOW_MS;

                        return (
                            <motion.div
                                key={m.materialId}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                            >
                                <Link
                                    href={`/m/materials/${m.materialId}`}
                                    className="group block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="aspect-[4/3] overflow-hidden relative bg-gray-50">
                                        {m.previewImages?.[0] ? (
                                            <Image
                                                src={`/uploads/previews/${m.previewImages[0]}`}
                                                alt={title || m.subject || m.type}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-white">
                                                <BookOpen size={24} className="text-blue-300" />
                                                <span className="text-[11px] font-bold text-gray-400">{m.subject}</span>
                                            </div>
                                        )}

                                        {activeTab === 'popular' ? (
                                            <span className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md text-[var(--color-dre-blue)] text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm border border-white/50">
                                                {idx + 1}위
                                            </span>
                                        ) : m.isFree ? (
                                            <span className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md text-[var(--color-dre-blue)] text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm border border-white/50">
                                                무료
                                            </span>
                                        ) : isNew ? (
                                            <span className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md text-[var(--color-dre-blue)] text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm border border-white/50">
                                                NEW
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="p-4">
                                        <p className="text-[13px] font-bold text-gray-900 truncate group-hover:text-[var(--color-dre-blue)] transition-colors">
                                            {title || m.subject}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1 truncate">{m.difficultyLabel} · {m.subject}</p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                <ShoppingBag size={10} />
                                                {(m.downloadCount ?? 0).toLocaleString()}
                                            </span>
                                            {m.isFree
                                                ? <span className="text-[12px] font-black text-[var(--color-dre-blue)]">무료</span>
                                                : ((m.priceProblem ?? 0) + (m.priceEtc ?? 0)) > 0
                                                    ? <span className="text-[12px] font-black text-gray-900">{((m.priceProblem ?? 0) + (m.priceEtc ?? 0)).toLocaleString()}원</span>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
