'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Award, Trophy, Medal, GraduationCap } from 'lucide-react';
import {
    clampReviewStars,
    DEFAULT_HALL_OF_FAME_ADMISSIONS,
    DEFAULT_HALL_OF_FAME_REVIEWS,
    type HallOfFameAdmission,
    type HallOfFameReview,
} from '@/lib/hall-of-fame';

interface Props {
    admissions?: HallOfFameAdmission[];
    reviews?: HallOfFameReview[];
}

export default function HallOfFameDetail({
    admissions = DEFAULT_HALL_OF_FAME_ADMISSIONS,
    reviews = DEFAULT_HALL_OF_FAME_REVIEWS,
}: Props) {
    const [activeTab, setActiveTab] = useState<'admission' | 'review'>('admission');
    const admissionItems = admissions.length > 0 ? admissions : DEFAULT_HALL_OF_FAME_ADMISSIONS;
    const reviewItems = reviews.length > 0 ? reviews : DEFAULT_HALL_OF_FAME_REVIEWS;

    return (
        <section className="hof-no-inner-scroll relative min-h-screen overflow-x-hidden bg-white py-14 md:py-24">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50 to-white -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Stats Banner - Premium Design */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative mb-14 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] sm:p-8 md:mb-20 md:p-12"
                >
                    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-dre-blue)] via-[var(--color-dre-blue-light)] to-blue-300" />

                    <div className="relative z-10 grid grid-cols-2 gap-5 divide-x divide-transparent sm:gap-6 md:grid-cols-4 md:gap-8 md:divide-gray-100">
                        <div className="text-center group flex flex-col items-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--color-dre-blue)] group-hover:text-white group-hover:shadow-lg sm:mb-4 sm:h-16 sm:w-16">
                                <Trophy className="w-8 h-8 text-[var(--color-dre-blue)] group-hover:text-white transition-colors" />
                            </div>
                            <div className="mb-1 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Goal</div>
                            <div className="text-xs font-medium text-gray-500 sm:text-sm">목표 대학 합격</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg sm:mb-4 sm:h-16 sm:w-16">
                                <Medal className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="mb-1 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Growth</div>
                            <div className="text-xs font-medium text-gray-500 sm:text-sm">놀라운 성적 향상</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg sm:mb-4 sm:h-16 sm:w-16">
                                <Award className="w-8 h-8 text-purple-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="mb-1 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Custom</div>
                            <div className="text-xs font-medium text-gray-500 sm:text-sm">1:1 맞춤 로드맵</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white group-hover:shadow-lg sm:mb-4 sm:h-16 sm:w-16">
                                <GraduationCap className="w-8 h-8 text-teal-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="mb-1 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Expert</div>
                            <div className="text-xs font-medium text-gray-500 sm:text-sm">입시 전문 코치진</div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="relative z-20 mb-10 flex justify-center md:mb-16"
                >
                    <div className="flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-full bg-gray-100/80 p-1.5 shadow-inner backdrop-blur-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <button
                            onClick={() => setActiveTab('admission')}
                            className={`relative z-10 shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 sm:px-7 sm:py-3 sm:text-base ${activeTab === 'admission' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {activeTab === 'admission' && (
                                <motion.div
                                    layoutId="hallOfFameTab"
                                    className="absolute inset-0 bg-[var(--color-dre-blue)] rounded-full shadow-[0_4px_14px_0_rgba(0,118,255,0.39)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                합격 명예의 전당
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('review')}
                            className={`relative z-10 shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 sm:px-7 sm:py-3 sm:text-base ${activeTab === 'review' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {activeTab === 'review' && (
                                <motion.div
                                    layoutId="hallOfFameTab"
                                    className="absolute inset-0 bg-[var(--color-dre-blue)] rounded-full shadow-[0_4px_14px_0_rgba(0,118,255,0.39)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                생생 수강 후기
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="relative min-h-[400px] overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'admission' ? (
                            <motion.div
                                key="admission"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="grid gap-6 md:grid-cols-3 md:gap-8"
                            >
                                {/* Admission Cards */}
                                {admissionItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] sm:p-8"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 z-0" />
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--color-dre-blue)]/[0.03] rounded-full blur-2xl group-hover:bg-[var(--color-dre-blue)]/[0.08] transition-colors duration-500" />

                                        <div className="absolute top-6 right-6 text-gray-100 group-hover:text-[var(--color-dre-blue)]/10 transition-colors duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                                            <Trophy size={80} strokeWidth={1} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="inline-flex items-center px-4 py-1.5 bg-blue-50/80 text-[var(--color-dre-blue)] text-sm font-bold rounded-full mb-6 backdrop-blur-sm border border-blue-100/50">
                                                {item.badge}
                                            </div>
                                            <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{item.univ}</h3>
                                            <p className="text-[var(--color-dre-blue)] mb-8 text-base font-semibold">{item.major}</p>

                                            <div className="border-t border-gray-100/80 pt-6">
                                                <p className="mb-4 text-[14px] font-medium leading-relaxed text-gray-700 sm:text-[15px]">&ldquo;{item.desc}&rdquo;</p>
                                                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase sm:text-sm">{item.student} · {item.school}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Placeholder for "Coming Soon" */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: admissionItems.length * 0.1 }}
                                    className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center opacity-70 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:min-h-[300px] sm:p-8"
                                >
                                    <Trophy size={48} className="text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400 mb-2">Next Hero</h3>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                        다음 명예의 전당 주인공은<br />
                                        바로 당신입니다.
                                    </p>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                            >
                                {reviewItems.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] sm:p-8"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <Quote size={80} className="text-gray-50 transform -translate-y-4 translate-x-4 rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex bg-yellow-50 px-3 py-1.5 rounded-full items-center gap-1">
                                                    {[...Array(clampReviewStars(review.stars))].map((_, i) => (
                                                        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                                    ))}
                                                </div>
                                                <Quote size={24} className="text-gray-200 group-hover:text-[var(--color-dre-blue)]/20 transition-colors" />
                                            </div>
                                            <p className="mb-7 text-[14px] font-medium leading-relaxed text-gray-700 sm:mb-8 sm:text-[15px]">
                                                &ldquo;{review.content}&rdquo;
                                            </p>
                                            <div className="flex items-center mt-auto border-t border-gray-50 pt-6">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold mr-4 shadow-inner text-lg">
                                                    {review.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-gray-900">{review.name}</div>
                                                    <div className="text-sm text-[var(--color-dre-blue)] font-medium bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1">{review.tag}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
