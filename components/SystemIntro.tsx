
'use client';

import { motion } from 'framer-motion';

const steps = [
    { id: 1, title: '입실', desc: '학습 준비' },
    { id: 2, title: '태도 세팅', desc: '감사노트 작성' },
    { id: 3, title: '진단', desc: '학습 상태 점검' },
    { id: 4, title: '개념 학습', desc: '자기주도 개념 이해' },
    { id: 5, title: '개념확인 문제', desc: '기본 이해도 체크' },
    { id: 6, title: '필수예제', desc: '구조적 문제 접근' },
    { id: 7, title: '확인문제', desc: '유형별 반복 학습' },
    { id: 8, title: '유사문제', desc: '변형 문제 훈련' },
    { id: 9, title: '오답 정리', desc: '메타인지 강화' },
    { id: 10, title: '과제 제시', desc: '학습의 연속성' },
];

export default function SystemIntro() {
    return (
        <section id="system" className="relative pb-24 bg-gray-50 overflow-hidden">
            {/* Top Divider (Reverse for top transition if needed, or just padding) */}

            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern-light z-0 opacity-40 pointer-events-none" />

            {/* Floating Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl"
                />
                <motion.div
                    animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-40 right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50 blur-xl"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-[var(--color-dre-blue)] mb-4"
                    >
                        DRE 10단계 표준 프로세스
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        누가 수업해도 결과가 같습니다.<br />
                        철저하게 설계된 10단계 시스템이 학생의 실력을 만듭니다.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Animated Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-[28px] left-0 right-0 h-[2px] bg-gray-200 -z-10 overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            whileInView={{ x: '0%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-[var(--color-dre-blue)] to-[var(--color-dre-navy)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                whileHover={{ y: -10 }}
                                className="relative flex flex-col items-center text-center group cursor-default"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 mb-4 z-10 shadow-sm group-hover:border-[var(--color-dre-blue)] group-hover:text-white group-hover:bg-[var(--color-dre-blue)] transition-all duration-300 transform group-hover:scale-110">
                                    {step.id}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--color-dre-blue)] transition-colors">{step.title}</h3>
                                <p className="text-sm text-gray-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
