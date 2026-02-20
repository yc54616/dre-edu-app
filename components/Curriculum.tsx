
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const curricula = {
    middle: {
        title: '중등부',
        desc: '내신 완벽 대비와 고등 수학의 기초',
        items: [
            '학교별 내신 기출 분석 및 대비',
            '고등 수학 연계 심화 학습',
            '취약 유형 집중 공략',
            '철저한 오답 관리 시스템',
        ],
    },
    high: {
        title: '고등부',
        desc: '수능과 내신, 입시 성공을 위한 실전력',
        items: [
            '수능/모의고사 기출 완벽 분석',
            '개인별 맞춤 입시 전략 컨설팅',
            '킬러 문항 대비 사고력 훈련',
            '실전 모의고사 및 피드백',
        ],
    },
};

type TabKey = keyof typeof curricula;

export default function Curriculum() {
    const [activeTab, setActiveTab] = useState<TabKey>('middle');

    return (
        <section id="curriculum" className="pt-12 pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        과정별 커리큘럼
                    </h2>
                    <p className="text-lg text-gray-600">
                        중등부터 고등 입시까지, 빈틈없는 로드맵을 제시합니다.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="bg-gray-100 p-1.5 rounded-full flex relative">
                        {(Object.keys(curricula) as TabKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`relative z-10 px-8 py-3 rounded-full text-base font-bold transition-colors duration-300 ${activeTab === key ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {activeTab === key && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[var(--color-dre-blue)] rounded-full shadow-lg"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{curricula[key].title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] transition-shadow duration-500 relative overflow-hidden"
                        >
                            {/* Noise Texture */}
                            <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none" />

                            <div className="relative z-10 mb-8">
                                <h3 className="text-3xl font-bold text-[var(--color-dre-blue)] mb-3">
                                    {curricula[activeTab].title}
                                </h3>
                                <p className="text-gray-600 text-lg">{curricula[activeTab].desc}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {curricula[activeTab].items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors duration-300 border border-transparent hover:border-[var(--color-dre-blue)]/30 group"
                                    >
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--color-dre-blue)]/10 flex items-center justify-center text-[var(--color-dre-blue)] mr-4 group-hover:bg-[var(--color-dre-blue)] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-800 font-medium text-lg">{item}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
